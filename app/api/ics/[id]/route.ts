import { NextRequest, NextResponse } from 'next/server';
import { getAbsenceEvents, createCalendarFile } from './ics';

const getICSFileById = async (id: string) => {
  console.log('Getting ICS file for id:', id);
  const events = await getAbsenceEvents();
  return createCalendarFile(events);
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log('ICS file requested:', id);

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const icsFile = await getICSFileById(id);
    if (!icsFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new Response(icsFile, {
      headers: { 'Content-Type': 'text/calendar' },
    });
  } catch (error) {
    console.error('Error fetching ICS file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
