import { AbsenceAPI } from '@utils/types';
import { NextRequest, NextResponse } from 'next/server';
import { getAbsencesFromDatabase } from './absences';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromYear = Number(searchParams.get('fromYear'));
    const toYear = Number(searchParams.get('toYear'));

    const absences: AbsenceAPI[] = await getAbsencesFromDatabase(
      fromYear,
      toYear
    );

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
