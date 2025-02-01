import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export interface AbsenceWithRelations {
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  notes: string | null;
  absentTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  };
  substituteTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  location: {
    name: string;
    abbreviation: string;
  };
  subject: {
    name: string;
    abbreviation: string;
  };
}

export const searchAbsences = async (): Promise<AbsenceWithRelations[]> => {
  try {
    const absences: AbsenceWithRelations[] = await prisma.absence.findMany({
      select: {
        lessonDate: true,
        subject: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
        lessonPlan: true,
        reasonOfAbsence: true,
        notes: true,
        absentTeacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        substituteTeacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
      },
    });

    return absences;
  } catch (err) {
    console.error('Error fetching absences:', err);
    throw err;
  }
};

export async function GET() {
  try {
    const absences = await searchAbsences();

    if (!absences.length) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    return NextResponse.json({ events: absences }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/getAbsences:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
