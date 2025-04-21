import {
  createLessonPlanReminderEmailBody,
  createUpcomingClaimedClassesEmailBody,
  createUrgentLessonPlanReminderEmailBody,
} from '@utils/emailTemplates';
import { getAdminEmails } from '@utils/getAdminEmails';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';
import { NextResponse } from 'next/server';

function addBusinessDays(startDate: Date, days: number): Date {
  const date = new Date(startDate);
  let count = 0;
  while (count < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 6 && date.getDay() !== 0) {
      count++;
    }
  }
  return date;
}

function getUTCDateWithoutTime(baseDate: Date, daysToAdd: number): Date {
  const date = addBusinessDays(baseDate, daysToAdd);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

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
          ? `URGENT - Sistema Toronto Tacet - submit your lesson plan ASAP`
          : `Sistema Toronto Tacet - reminder to upload lesson plan`,
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

async function sendClaimSummaries(): Promise<number> {
  const today = new Date();
  const start = getUTCDateWithoutTime(today, 0);
  const end = getUTCDateWithoutTime(today, 7);

  const users = await prisma.user.findMany({
    where: {
      substitutes: {
        some: { lessonDate: { gte: start, lt: end } },
      },
    },
    include: {
      substitutes: {
        where: { lessonDate: { gte: start, lt: end } },
        include: {
          location: { select: { name: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });
  if (users.length === 0) return 0;

  const adminEmails = await getAdminEmails();

  const tasks = users.map(async (user) => {
    const absences = user.substitutes.map((absence) => ({
      lessonDate: absence.lessonDate,
      location: absence.location,
      subject: absence.subject,
    }));
    const html = createUpcomingClaimedClassesEmailBody(
      { firstName: user.firstName, lastName: user.lastName },
      absences
    );
    const { success } = await sendEmail({
      to: [user.email],
      cc: adminEmails,
      subject: 'Sistema Toronto Tacet - Your Upcoming Claimed Classes',
      html,
    });
    return success;
  });

  const results = await Promise.allSettled(tasks);
  return results.filter((r) => r.status === 'fulfilled' && r.value === true)
    .length;
}

export async function GET(req: Request) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const [sevenDayCount, twoDayCount] = await Promise.all([
      sendReminders(7, false),
      sendReminders(2, true),
    ]);

    const summaryCount = await sendClaimSummaries();

    return NextResponse.json({
      message: `Sent ${sevenDayCount + twoDayCount} lesson‑plan reminders and ${summaryCount} claim summaries successfully`,
      breakdown: {
        sevenDayReminders: sevenDayCount,
        twoDayReminders: twoDayCount,
        claimedClassSummaries: summaryCount,
      },
    });
  } catch (error) {
    console.error('Reminder workflow failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
