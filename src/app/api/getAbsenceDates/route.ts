import { YearlyAbsenceData } from '@utils/types';
import { NextResponse } from 'next/server';
import { getAbsenceYearRanges } from './absenceDates';

export async function GET() {
  try {
    const absenceDates: YearlyAbsenceData[] = await getAbsenceYearRanges();

    if (!absenceDates.length) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    return NextResponse.json({ events: absenceDates }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/getAbsenceDates:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
