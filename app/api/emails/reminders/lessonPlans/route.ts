import { getUTCDateWithoutTime } from '@utils/dates';
import {
  createLessonPlanReminderEmailBody,
  createUrgentLessonPlanReminderEmailBody,
} from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

async function getUsersWithPendingLessonPlans(targetDate: Date, nextDay: Date) {
  try {
    return await prisma.user.findMany({
      where: {
        absences: {
          some: {
            lessonDate: { gte: targetDate, lt: nextDay },
            lessonPlan: null,
          },
        },
      },
      include: {
        absences: {
          where: {
            lessonDate: { gte: targetDate, lt: nextDay },
            lessonPlan: null,
          },
          include: {
            location: { select: { name: true } },
            subject: { select: { name: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users with pending lesson plans:', error);
    return [];
  }
}

async function sendReminders(
  daysBefore: number,
  isUrgent: boolean
): Promise<number> {
  const today = new Date();
  const targetDate = getUTCDateWithoutTime(today, daysBefore);
  const nextDay = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate() + 1
    )
  );
  const users = await getUsersWithPendingLessonPlans(targetDate, nextDay);

  if (users.length === 0) {
    console.log('No users found with absences to send reminders.');
    return 0;
  }

  const adminEmails = await getAdminEmails();

  const emailPromises = users.flatMap((user) =>
    user.absences.map(async (absence) => {
      const emailBody = isUrgent
        ? createUrgentLessonPlanReminderEmailBody(user, absence)
        : createLessonPlanReminderEmailBody(user, absence);
      const emailContent = {
        to: [user.email],
        cc: isUrgent ? adminEmails : undefined,
        subject: isUrgent
          ? 'URGENT - Sistema Toronto Tacet - Submit Your Lesson Plan ASAP'
          : 'Sistema Toronto Tacet - Reminder to Upload Lesson Plan',
        html: emailBody,
      };

      const result = await sendEmail(emailContent);
      return result.success;
    })
  );

  const results = await Promise.allSettled(emailPromises);
  const successfulEmails = results.filter(
    (r) => r.status === 'fulfilled' && r.value === true
  ).length;

  return successfulEmails;
}

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [sevenDayCount, twoDayCount] = await Promise.all([
      sendReminders(7, false),
      sendReminders(2, true),
    ]);

    const message = [
      `Sent ${sevenDayCount} standard lesson-plan reminders (7 days ahead)`,
      `Sent ${twoDayCount} URGENT lesson-plan reminders (2 days ahead)`,
    ].join(', ');

    return NextResponse.json({
      message,
      breakdown: {
        sevenDayReminders: sevenDayCount,
        twoDayReminders: twoDayCount,
      },
    });
  } catch (error) {
    console.error('Lesson plan reminders failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
