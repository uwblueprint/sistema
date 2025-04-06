import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';
import { sendEmail } from '@utils/sendEmail';

const UPLOAD_LINK = `${process.env.NEXT_PUBLIC_PROD_URL!}/calendar`;

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

async function getAdminEmails(allowedDomain: string): Promise<string[]> {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    return adminUsers
      .map((user) => user.email)
      .filter((email) => email.endsWith(`@${allowedDomain}`));
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
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

function createEmailBody(user: any, absence: any, isUrgent: boolean): string {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDate = dateFormatter.format(absence.lessonDate);

  return isUrgent
    ? `
      <html>
        <body>
          <p>Hello ${user.firstName},</p>
          <p>Your planned absence from ${absence.subject.name} at ${absence.location.name} 
          is in 2 business days, and we have not received your lesson plan.</p>
          <p><strong><span style="color: red;">Please upload the lesson plan today.</span></strong></p>
          <p><strong>Click the link below to upload:</strong><br/><a href="${UPLOAD_LINK}" target="_blank">Tacet Calendar</a></p>
          <p>Sistema Toronto</p>
        </body>
      </html>
    `
    : `
      <html>
        <body>
          <p>Hello ${user.firstName},</p>
          <p>Please upload your lesson plan for your upcoming absence on ${formattedDate}.</p>
          <p><strong>Click the link below to upload:</strong><br/><a href="${UPLOAD_LINK}" target="_blank">Tacet Calendar</a></p>
          <p>Sistema Toronto</p>
        </body>
      </html>
    `;
}

async function sendReminders(
  daysBefore: number,
  isUrgent: boolean
): Promise<number> {
  const today = new Date();
  const targetDate = getUTCDateWithoutTime(today, daysBefore);
  const nextDay = new Date(targetDate.getTime() + 86400000);
  const allowedDomain = process.env.SISTEMA_EMAIL_DOMAIN!;

  const users = await getUsersWithPendingLessonPlans(targetDate, nextDay);

  if (users.length === 0) {
    console.log('No users found with absences to send reminders.');
    return 0;
  }

  const adminEmails = await getAdminEmails(allowedDomain);

  const emailPromises = users.flatMap((user) =>
    user.absences.map(async (absence) => {
      if (!user.email.endsWith(`@${allowedDomain}`)) {
        console.warn(
          `Skipped email to ${user.email} due to domain restriction`
        );
        return false;
      }

      const emailBody = createEmailBody(user, absence, isUrgent);
      const emailContent = {
        to: user.email,
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

    return NextResponse.json({
      message: `Sent ${sevenDayCount + twoDayCount} reminders successfully`,
      breakdown: {
        sevenDayReminders: sevenDayCount,
        twoDayReminders: twoDayCount,
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
