import { createAbsenceDeletionEmailBody } from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const {
    teacher,
    substituteTeacher,
    absence,
  }: {
    teacher: {
      firstName: string;
      lastName: string;
      email: string;
    };
    substituteTeacher?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    absence: {
      lessonDate: string;
      subject: { name: string };
      location: { name: string };
    };
  } = await req.json();

  const html = createAbsenceDeletionEmailBody(
    { firstName: teacher.firstName, lastName: teacher.lastName },
    {
      lessonDate: new Date(absence.lessonDate),
      subject: absence.subject,
      location: absence.location,
    }
  );

  const to = [teacher.email];
  const admins = await getAdminEmails();
  const cc = [...admins];
  if (substituteTeacher?.email) cc.push(substituteTeacher.email);

  const { success, error } = await sendEmail({
    to,
    cc,
    subject: 'Sistema Toronto Tacet - Absence Deleted',
    html,
  });

  if (!success) {
    console.error('Delete email error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
