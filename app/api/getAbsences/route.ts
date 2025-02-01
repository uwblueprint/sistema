import { NextResponse } from 'next/server';
import { AbsenceWithRelations, searchAbsences } from './absences';

export async function GET() {
  try {
    const absences: AbsenceWithRelations[] = await searchAbsences();

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
