import { createLessonPlanUploadedEmailBody } from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { absenceId, isSwap = false } = await req.json();

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

  const html = createLessonPlanUploadedEmailBody(
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
  const cc: string[] = [];
  if (absence.substituteTeacher?.email) {
    cc.push(absence.substituteTeacher.email);
  }

  if (!isSwap) {
    const admins = await getAdminEmails();
    cc.push(...admins);
  }

  const { success, error } = await sendEmail({
    to,
    cc,
    subject: 'Sistema Toronto Tacet - A Lesson Plan Has Been Uploaded',
    html,
  });

  if (!success) {
    console.error('Email error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
