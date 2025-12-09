import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        colorGroup: true,
      },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, abbreviation, colorGroupId } = await request.json();
    if (!name || colorGroupId === undefined) {
      return NextResponse.json(
        { error: 'Subject name and color group are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure both subject creation and mailing list setup are atomic
    const subject = await prisma.$transaction(async (tx) => {
      // Create the new subject
      const newSubject = await tx.subject.create({
        data: {
          name,
          abbreviation: abbreviation || '',
          colorGroupId,
        },
        include: {
          colorGroup: true,
        },
      });

      // Get all users to automatically add them to the mailing list for this subject
      const allUsers = await tx.user.findMany({
        select: { id: true },
      });

      // Create MailingList entries for each user with this new subject
      for (const user of allUsers) {
        await tx.mailingList.create({
          data: {
            userId: user.id,
            subjectId: newSubject.id,
          },
        });
      }

      return newSubject;
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      {
        error: 'Unable to create subject.',
      },
      { status: 500 }
    );
  }
}
