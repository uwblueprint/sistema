import { getUTCDateWithoutTime } from '@utils/dates';
import {
  createNonUrgentAbsenceEmailBody,
  createUrgentAbsenceEmailBody,
} from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { absenceId, isUrgent } = await req.json();

  const absence = await prisma.absence.findUnique({
    where: { id: absenceId },
    include: {
      location: true,
      subject: true,
      lessonPlan: { select: { name: true, url: true } },
    },
  });

  if (!absence) {
    return NextResponse.json({ error: 'Absence not found' }, { status: 404 });
  }

  const today = getUTCDateWithoutTime(new Date(), 0);
  const lessonDay = getUTCDateWithoutTime(absence.lessonDate, 0);
  if (lessonDay < today) {
    return NextResponse.json(
      { success: false, error: 'Absence is in the past, no email sent.' },
      { status: 200 }
    );
  }

  const html = isUrgent
    ? createUrgentAbsenceEmailBody(absence)
    : createNonUrgentAbsenceEmailBody(absence);

  const subjectLine = isUrgent
    ? 'URGENT - Sistema Toronto Tacet - Last-Minute Absence Available to Fill'
    : 'Sistema Toronto Tacet - New Absence Available to Fill';

  const adminEmails = await getAdminEmails();

  let bccList: string[] = [];

  if (isUrgent) {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { email: true },
    });
    bccList = teachers.map((t) => t.email);
  } else {
    const mailingListEntries = await prisma.mailingList.findMany({
      where: { subjectId: absence.subjectId },
      select: { user: { select: { email: true } } },
    });
    bccList = mailingListEntries.map((entry) => entry.user.email);
  }

  const { success, error } = await sendEmail({
    to: [],
    cc: adminEmails,
    bcc: bccList,
    subject: subjectLine,
    html,
  });

  if (!success) {
    console.error('Absence notification email failed:', error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
