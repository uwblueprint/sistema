import { getUTCDateWithoutTime } from '@utils/dates';
import { createUpcomingUnfilledAbsencesEmailBody } from '@utils/emailTemplates';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

async function sendUnfilledAbsenceOpportunities(): Promise<number> {
  const today = new Date();
  const weekday = today.getUTCDay();
  if (weekday === 0 || weekday === 6) return 0;

  const start = getUTCDateWithoutTime(today, 0);
  const end = getUTCDateWithoutTime(today, 3);
  const nextDay = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1)
  );

  const absences = await prisma.absence.findMany({
    where: {
      substituteTeacherId: null,
      lessonDate: { gte: start, lt: nextDay },
    },
    include: {
      location: { select: { name: true } },
      subject: { select: { name: true } },
    },
  });
  if (absences.length === 0) return 0;

  const teachers = await prisma.user.findMany({
    select: { firstName: true, lastName: true, email: true },
  });

  const tasks = teachers.map((teacher) => {
    const html = createUpcomingUnfilledAbsencesEmailBody(
      { firstName: teacher.firstName, lastName: teacher.lastName },
      absences.map((a) => ({
        lessonDate: a.lessonDate,
        location: a.location,
        subject: a.subject,
      }))
    );

    return sendEmail({
      to: [teacher.email],
      subject:
        'Sistema Toronto Tacet - Unclaimed Classes in the Next 3 Business Days',
      html,
    })
      .then((r) => r.success)
      .catch(() => false);
  });

  const results = await Promise.allSettled(tasks);
  return results.filter((r) => r.status === 'fulfilled' && r.value).length;
}

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const unfilledCount = await sendUnfilledAbsenceOpportunities();

    const message = `Sent ${unfilledCount} unclaimed-classes opportunity emails`;

    return NextResponse.json({
      message,
      breakdown: { unfilledOpportunities: unfilledCount },
    });
  } catch (err) {
    console.error('Unfilled absence opportunities failed:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
