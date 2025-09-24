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
      subject: { select: { id: true, name: true } },
    },
  });
  if (absences.length === 0) return 0;

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      mailingLists: {
        where: { subject: { archived: false } },
        select: { subjectId: true },
      },
    },
  });

  const tasks = teachers.map(async (teacher) => {
    const subscribedSubjectIds = new Set(
      teacher.mailingLists.map((list) => list.subjectId)
    );

    if (subscribedSubjectIds.size === 0) {
      return false;
    }

    const relevantAbsences = absences.filter((absence) =>
      subscribedSubjectIds.has(absence.subjectId)
    );

    if (relevantAbsences.length === 0) {
      return false;
    }

    const html = createUpcomingUnfilledAbsencesEmailBody(
      { firstName: teacher.firstName, lastName: teacher.lastName },
      relevantAbsences.map((absence) => ({
        lessonDate: absence.lessonDate,
        location: absence.location,
        subject: absence.subject,
      }))
    );

    try {
      const { success } = await sendEmail({
        to: [teacher.email],
        subject:
          'Sistema Toronto Tacet - Unfilled Classes in the Next 3 Business Days',
        html,
      });

      return success;
    } catch {
      return false;
    }
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

    const message = `Sent ${unfilledCount} unfilled-classes opportunity emails`;

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
