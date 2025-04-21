import { createAbsenceModificationEmailBody } from '@utils/emailTemplates';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';
import { getAdminEmails } from '@utils/getAdminEmails';

export async function POST(req: Request) {
  const { absenceId } = await req.json();

  const absence = await prisma.absence.findUnique({
    where: { id: absenceId },
    include: {
      absentTeacher: {
        select: { firstName: true, lastName: true, email: true },
      },
      substituteTeacher: { select: { email: true } },
      location: true,
      subject: true,
      lessonPlan: { select: { name: true, url: true } },
    },
  });
  if (!absence) {
    return NextResponse.json({ error: 'Absence not found' }, { status: 404 });
  }

  const html = createAbsenceModificationEmailBody(
    {
      firstName: absence.absentTeacher.firstName,
      lastName: absence.absentTeacher.lastName,
    },
    {
      lessonDate: absence.lessonDate,
      subject: absence.subject,
      location: absence.location,
      lessonPlan: absence.lessonPlan,
    }
  );

  const to = [absence.absentTeacher.email];
  if (absence.substituteTeacher?.email) {
    to.push(absence.substituteTeacher.email);
  }
  const cc = await getAdminEmails();

  const { success, error } = await sendEmail({
    to,
    cc,
    subject: 'Sistema Toronto Tacet - A Change Has Been Made',
    html,
  });

  if (!success) {
    console.error('Email error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
