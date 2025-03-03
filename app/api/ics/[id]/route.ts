import { NextRequest, NextResponse } from 'next/server';
import { getAbsencesFromDatabase } from '../../getAbsences/absences';
import { convertAbsenceToICSEvent, createCalendarFile } from './ics';

const getICSFileById = async (id: string) => {
  console.log('Getting ICS file for id:', id);
  const absences = await getAbsencesFromDatabase();
  const events = absences.map(convertAbsenceToICSEvent);
  return createCalendarFile(events);
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const icsFile = await getICSFileById(id);
    if (!icsFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert file to response
    const buffer = await icsFile.arrayBuffer();
    const blob = new Blob([buffer], { type: 'text/calendar' });

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename=${id}`,
      },
    });
  } catch (error) {
    console.error('Error fetching ICS file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
