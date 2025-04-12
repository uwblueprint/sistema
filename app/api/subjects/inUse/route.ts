import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET() {
  try {
    // Find all subjects that are used in any absences
    const subjectsInUse = await prisma.absence.findMany({
      select: {
        subjectId: true,
      },
      distinct: ['subjectId'],
      where: {
        subjectId: {
          not: undefined,
        },
      },
    });

    // Extract the subject IDs and filter out any null values
    const subjectIds = subjectsInUse
      .map((absence) => absence.subjectId)
      .filter((id): id is number => id !== null && id !== undefined);

    return NextResponse.json({ subjectsInUse: subjectIds });
  } catch (error) {
    console.error('Error checking subjects in use:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
