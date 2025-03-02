import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

function validateId(id: string): number | null {
  const parsedId = Number(id);
  return Number.isNaN(parsedId) ? null : parsedId;
}

// GET endpoint to retrieve all mailing lists for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const validatedId = validateId(id);
  if (validatedId === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.mailingLists);
  } catch (error) {
    console.error('Error fetching user mailing lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a user's mailing lists
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const validatedId = validateId(id);
  if (validatedId === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const { subjectIds } = await request.json();

    if (!Array.isArray(subjectIds)) {
      return NextResponse.json(
        { error: 'Subject IDs must be an array' },
        { status: 400 }
      );
    }

    // First, delete all existing mailing lists for this user
    await prisma.mailingList.deleteMany({
      where: { userId: validatedId },
    });

    // Then create new entries for each subject ID
    const mailingListData = subjectIds.map((subjectId) => ({
      userId: validatedId,
      subjectId,
    }));

    await prisma.mailingList.createMany({
      data: mailingListData,
    });

    // Return the updated user with mailing lists
    const updatedUser = await prisma.user.findUnique({
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

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser.mailingLists);
  } catch (error) {
    console.error('Error updating user mailing lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
