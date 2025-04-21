import {
  createLessonPlanReminderEmailBody,
  createUpcomingClaimedClassesEmailBody,
  createUrgentLessonPlanReminderEmailBody,
  createUpcomingClaimedClassReminderEmailBody,
  createUpcomingUnfilledAbsencesEmailBody,
  createDailyDeclarationDigestEmailBody,
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
    if (date.getUTCDay() !== 6 && date.getUTCDay() !== 0) {
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

async function sendClaimSummaries(): Promise<number> {
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
    const html = createUpcomingClaimedClassesEmailBody(
      { firstName: user.firstName, lastName: user.lastName },
      absences
    );
    const { success } = await sendEmail({
      to: [user.email],
      subject: 'Sistema Toronto Tacet - Your Upcoming Claimed Classes',
      html,
    });
    return success;
  });

  const results = await Promise.allSettled(tasks);
  return results.filter((r) => r.status === 'fulfilled' && r.value === true)
    .length;
}

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

    const today = new Date();
    const isFriday = today.getUTCDay() === 5;
    const summaryCount = isFriday ? await sendClaimSummaries() : 0;

    const tomorrowCount = await sendUpcomingClaimedClassReminders();

    const unfilledCount = await sendUnfilledAbsenceOpportunities();
    const dailyDigestCount = await sendDailyDeclarationDigests();

    return NextResponse.json({
      message: [
        `Sent ${sevenDayCount + twoDayCount} lesson‑plan reminders`,
        `${tomorrowCount} tomorrow‑class reminders`,
        `${unfilledCount} unclaimed‑classes opportunity emails`,
        `${dailyDigestCount} daily declaration digests`,
        isFriday ? `and ${summaryCount} weekly summaries.` : '.',
      ].join(', '),
      breakdown: {
        sevenDayReminders: sevenDayCount,
        twoDayReminders: twoDayCount,
        tomorrowClassReminders: tomorrowCount,
        unfilledOpportunities: unfilledCount,
        dailyDigests: dailyDigestCount,
        weeklySummaries: summaryCount,
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
