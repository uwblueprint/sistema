import { createUrgentLastMinuteAbsenceEmailBody } from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { absenceId } = await req.json();

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
  if (absence.substituteTeacherId) {
    return NextResponse.json(
      { error: 'This absence has already been claimed' },
      { status: 400 }
    );
  }

  const html = createUrgentLastMinuteAbsenceEmailBody({
    lessonDate: absence.lessonDate,
    location: absence.location,
    subject: absence.subject,
    lessonPlan: absence.lessonPlan,
  });

  const adminEmails = await getAdminEmails();

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { email: true },
  });
  const bccList = teachers.map((t) => t.email);

  const { success, error } = await sendEmail({
    to: [],
    cc: adminEmails,
    bcc: bccList,
    subject:
      'URGENT - Sistema Toronto Tacet - Last-Minute Absence Available to Claim',
    html,
  });

  if (!success) {
    console.error('Urgent absence alert failed:', error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
