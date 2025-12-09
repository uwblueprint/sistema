import { createAbsenceFillConfirmationEmailBody } from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { absenceId } = await req.json();

  const absence = await prisma.absence.findUnique({
    where: { id: absenceId },
    include: {
      absentTeacher: {
        select: { firstName: true, lastName: true, email: true },
      },
      substituteTeacher: {
        select: { firstName: true, lastName: true, email: true },
      },
      location: true,
      subject: true,
      lessonPlan: { select: { name: true, url: true } },
    },
  });

  if (!absence) {
    return NextResponse.json({ error: 'Absence not found' }, { status: 404 });
  }

  if (!absence.substituteTeacher) {
    return NextResponse.json(
      { error: 'No filling teacher on this absence' },
      { status: 400 }
    );
  }

  const html = createAbsenceFillConfirmationEmailBody(
    {
      firstName: absence.substituteTeacher.firstName,
      lastName: absence.substituteTeacher.lastName,
    },
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

  const to = [absence.substituteTeacher.email];
  const admins = await getAdminEmails();
  const cc = [...admins, absence.absentTeacher.email];

  const { success, error } = await sendEmail({
    to,
    cc,
    subject: 'Sistema Toronto Tacet - An Absence Has Been Filled',
    html,
  });

  if (!success) {
    console.error('Fill email error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
