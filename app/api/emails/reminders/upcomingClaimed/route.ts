import { getUTCDateWithoutTime } from '@utils/dates';
import { createUpcomingClaimedClassReminderEmailBody } from '@utils/emailTemplates';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

async function sendUpcomingClaimedClassReminders(): Promise<number> {
  const today = new Date();
  const next = getUTCDateWithoutTime(today, 1);
  const nextDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate() + 1)
  );

  const users = await prisma.user.findMany({
    where: {
      substitutes: {
        some: { lessonDate: { gte: next, lt: nextDay } },
      },
    },
    include: {
      substitutes: {
        where: { lessonDate: { gte: next, lt: nextDay } },
        include: {
          location: { select: { name: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });

  if (users.length === 0) return 0;

  const emailTasks = users.flatMap((user) =>
    user.substitutes.map((absence) => {
      const html = createUpcomingClaimedClassReminderEmailBody(
        { firstName: user.firstName, lastName: user.lastName },
        {
          lessonDate: absence.lessonDate,
          subject: absence.subject,
          location: absence.location,
        }
      );
      return sendEmail({
        to: [user.email],
        subject: 'Sistema Toronto Tacet - Upcoming Claimed Class Reminder',
        html,
      })
        .then((r) => r.success)
        .catch(() => false);
    })
  );

  const results = await Promise.allSettled(emailTasks);
  return results.filter((r) => r.status === 'fulfilled' && r.value).length;
}

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tomorrowClassReminders = await sendUpcomingClaimedClassReminders();

    const message = `Sent ${tomorrowClassReminders} tomorrow-class reminders`;

    return NextResponse.json({
      message,
      breakdown: { tomorrowClassReminders },
    });
  } catch (err) {
    console.error('Upcoming claimed class reminders failed:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
