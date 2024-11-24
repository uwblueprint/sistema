import { prisma } from '../../../utils/prisma';
import { NextResponse } from 'next/server';
import { AbsenceWithRelations } from '../../../types/absence';

export async function GET() {
  try {
    const absences: AbsenceWithRelations[] = await prisma.absence.findMany({
      select: {
        id: true,
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
