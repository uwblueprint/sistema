import { NextRequest, NextResponse } from 'next/server';
import { getAbsencesFromDatabase } from '../../getAbsences/absences';
import { convertAbsenceToICSEvent, createCalendarFile } from './ics';

const getICSFileById = async (id: string) => {
  console.log('Getting ICS file for id:', id);
  const absences = await getAbsencesFromDatabase();

  const userIdMatch = id.match(/^user-(\d+)$/);

  if (userIdMatch) {
    const userId = parseInt(userIdMatch[1], 10);
    if (!isNaN(userId)) {
      const userAbsences = absences.filter(
        (absence) =>
          absence.absentTeacher.id === userId ||
          absence.substituteTeacher?.id === userId
      );

      const events = userAbsences.map((absence) => {
        const event = convertAbsenceToICSEvent(absence);
        event.calName = 'My Sistema Absences';
        return event;
      });

      return createCalendarFile(events);
    }
  }

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

  const cleanId = id.replace(/\.ics$/, '');

  try {
    const icsFile = await getICSFileById(cleanId);
    if (!icsFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const isUserCalendar = cleanId.startsWith('user-');
    const filename = isUserCalendar
      ? 'my-sistema-absences.ics'
      : 'sistema-absences.ics';

    const buffer = await icsFile.arrayBuffer();
    const blob = new Blob([buffer], { type: 'text/calendar' });

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="${filename}"`,
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
