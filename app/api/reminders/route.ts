import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

// Configuration constants
const UPLOAD_LINK = 'https://sistema-prod.vercel.app/calendar';
const ADMIN_EMAIL = 'admin@sistema.ca';
const EMAIL_API_ENDPOINT = 'http://localhost:3000/api/sendEmail';

// Function to calculate business days
function addBusinessDays(date: Date, days: number): Date {
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

async function sendReminders(daysBefore: number, isUrgent: boolean) {
  const today = new Date();
  const targetDate = getUTCDateWithoutTime(today, daysBefore);
  const nextDay = new Date(targetDate.getTime() + 86400000);

  // Get all absences matching the criteria
  const users = await prisma.user.findMany({
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

  // Format date for display
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Process all absences across users
  const emailPromises = users.flatMap((user) =>
    user.absences.map(async (absence) => {
      const formattedDate = dateFormatter.format(absence.lessonDate);

      const emailContent = {
        to: user.email,
        cc: isUrgent ? ADMIN_EMAIL : undefined,
        subject: isUrgent
          ? `URGENT - Sistema Toronto Tacet - submit your lesson plan ASAP`
          : `Sistema Toronto Tacet - reminder to upload lesson plan`,
        text: isUrgent
          ? `Hello ${user.firstName},\n\n` +
            `Your planned absence from ${absence.subject.name} at ${absence.location.name} ` +
            `is in 2 days and we have not received your lesson plan.\n\n` +
            `Please upload the lesson plan today.\n\n` +
            `Click the link below to upload:\n${UPLOAD_LINK}\n\n` +
            `Sistema Toronto`
          : `Hello ${user.firstName},\n\n` +
            `Please upload your lesson plan for your upcoming absence on ${formattedDate}.\n\n` +
            `Click the link below to upload:\n${UPLOAD_LINK}\n\n` +
            `Sistema Toronto`,
      };

      const response = await fetch(EMAIL_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailContent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to send email to ${user.email}:`, errorData);
        throw new Error(`Email failed: ${user.email}`);
      }
    })
  );

  await Promise.all(emailPromises);
  return emailPromises.length;
}

export async function GET() {
  try {
    const sevenDayCount = await sendReminders(7, false);
    const twoDayCount = await sendReminders(2, true);

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
