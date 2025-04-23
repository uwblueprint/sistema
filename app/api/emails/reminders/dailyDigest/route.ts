import { getUTCDateWithoutTime } from '@utils/dates';
import { createDailyDeclarationDigestEmailBody } from '@utils/emailTemplates';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

async function sendDailyDeclarationDigests(): Promise<number> {
  const now = new Date();
  // Add 5 minute buffer to account for unpredictable cron job times
  const windowAgo = new Date(now.getTime() - (24 * 60 + 5) * 60 * 1000);
  const urgentCutoff = getUTCDateWithoutTime(now, 7);

  const recent = await prisma.absence.findMany({
    where: {
      createdAt: { gte: windowAgo },
      substituteTeacherId: null,
    },
    include: {
      location: { select: { name: true } },
      subject: { select: { id: true, name: true } },
      lessonPlan: { select: { name: true, url: true } },
    },
  });

  if (recent.length === 0) return 0;

  const urgent = recent.filter((a) => a.lessonDate <= urgentCutoff);
  const nonUrgent = recent.filter((a) => a.lessonDate > urgentCutoff);

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      mailingLists: {
        select: { subject: { select: { id: true } } },
      },
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  let sent = 0;

  await Promise.all(
    teachers.map(async (teacher) => {
      const subs = new Set(teacher.mailingLists.map((ml) => ml.subject.id));
      const teacherNonUrgent = nonUrgent.filter((a) => subs.has(a.subject.id));

      if (urgent.length === 0 && teacherNonUrgent.length === 0) return;

      const html = createDailyDeclarationDigestEmailBody(
        { firstName: teacher.firstName, lastName: teacher.lastName },
        urgent,
        teacherNonUrgent
      );

      const { success } = await sendEmail({
        to: [teacher.email],
        subject: 'Sistema Toronto Tacet - Daily Declaration Digest',
        html,
      });

      if (success) sent++;
    })
  );

  await Promise.all(
    admins.map(async (admin) => {
      if (urgent.length === 0 && nonUrgent.length === 0) return;

      const html = createDailyDeclarationDigestEmailBody(
        { firstName: admin.firstName, lastName: admin.lastName },
        urgent,
        nonUrgent
      );

      const { success } = await sendEmail({
        to: [admin.email],
        subject: 'Sistema Toronto Tacet - Daily Declaration Digest',
        html,
      });

      if (success) sent++;
    })
  );

  return sent;
}

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dailyDigests = await sendDailyDeclarationDigests();

    return NextResponse.json({
      message: `Sent ${dailyDigests} daily declaration digests`,
      breakdown: { dailyDigests },
    });
  } catch (err) {
    console.error('Daily declaration digest failed:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
