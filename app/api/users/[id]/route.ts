import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

function validateId(id: string): number | null {
  const parsedId = Number(id);
  return Number.isNaN(parsedId) ? null : parsedId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const validatedId = validateId(id);
  if (validatedId === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const getAbsences = searchParams.get('getAbsences') === 'true';
  const getMailingLists = searchParams.get('getMailingLists') === 'true';

  try {
    const user = await prisma.user.findUnique({
      where: { id: validatedId },
      include: {
        absences: getAbsences,
        mailingLists: getMailingLists
          ? {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    abbreviation: true,
                    colorGroup: {
                      select: { colorCodes: true },
                    },
                  },
                },
              },
            }
          : false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const validatedId = validateId(id);
  if (validatedId === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const { email, firstName, lastName, role, mailingListSubjectIds } =
      await request.json();

    // Update basic user data if provided
    const userData: any = {};
    if (email !== undefined) userData.email = email;
    if (firstName !== undefined) userData.firstName = firstName;
    if (lastName !== undefined) userData.lastName = lastName;
    if (role !== undefined) userData.role = role;

    let updatedUser;

    // If mailingListSubjectIds is provided, we need to update the mailing lists
    if (mailingListSubjectIds !== undefined) {
      if (!Array.isArray(mailingListSubjectIds)) {
        return NextResponse.json(
          { error: 'mailingListSubjectIds must be an array' },
          { status: 400 }
        );
      }

      // First update the user data
      updatedUser = await prisma.user.update({
        where: { id: validatedId },
        data: userData,
      });

      // Then delete all existing mailing lists for this user
      await prisma.mailingList.deleteMany({
        where: { userId: validatedId },
      });

      // Then create new entries for each subject ID
      if (mailingListSubjectIds.length > 0) {
        const mailingListData = mailingListSubjectIds.map((subjectId) => ({
          userId: validatedId,
          subjectId,
        }));

        await prisma.mailingList.createMany({
          data: mailingListData,
        });
      }

      // Return the updated user with mailing lists
      updatedUser = await prisma.user.findUnique({
        where: { id: validatedId },
        include: {
          mailingLists: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true,
                  colorGroup: {
                    select: {
                      colorCodes: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // Just update user data without touching mailing lists
      updatedUser = await prisma.user.update({
        where: { id: validatedId },
        data: userData,
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
