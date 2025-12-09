import { getUTCDateWithoutTime } from '@utils/dates';
import { createUpcomingFilledClassesEmailBody } from '@utils/emailTemplates';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

async function sendFillSummaries(): Promise<number> {
  const today = new Date();
  const start = getUTCDateWithoutTime(today, 0);
  const end = getUTCDateWithoutTime(today, 7);
  const nextDay = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1)
  );

  const users = await prisma.user.findMany({
    where: {
      substitutes: {
        some: { lessonDate: { gte: start, lt: nextDay } },
      },
    },
    include: {
      substitutes: {
        where: { lessonDate: { gte: start, lt: nextDay } },
        include: {
          location: { select: { name: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });
  if (users.length === 0) return 0;

  const tasks = users.map(async (user) => {
    const absences = user.substitutes.map((absence) => ({
      lessonDate: absence.lessonDate,
      location: absence.location,
      subject: absence.subject,
    }));
    const html = createUpcomingFilledClassesEmailBody(
      { firstName: user.firstName, lastName: user.lastName },
      absences
    );
    const { success } = await sendEmail({
      to: [user.email],
      subject: 'Sistema Toronto Tacet - Your Upcoming Filled Classes',
      html,
    });
    return success;
  });

  const results = await Promise.allSettled(tasks);
  return results.filter((r) => r.status === 'fulfilled' && r.value === true)
    .length;
}

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Only run on Fridays
    const today = new Date();
    const isFriday = today.getUTCDay() === 5;
    const weeklySummaries = isFriday ? await sendFillSummaries() : 0;

    const message = `Sent ${weeklySummaries} weekly summaries.`;

    return NextResponse.json({
      message,
      breakdown: { weeklySummaries },
    });
  } catch (err) {
    console.error('Fill summaries failed:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
