import { AbsenceAPI } from '@utils/types';
import { NextResponse } from 'next/server';
import { getAbsencesFromDatabase } from './absences';

export interface AbsenceWithRelations {
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  notes: string | null;
  absentTeacherId: number;
  substituteTeacherId: number | null;
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

export async function GET() {
  try {
    const absences: AbsenceAPI[] = await getAbsencesFromDatabase();

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
