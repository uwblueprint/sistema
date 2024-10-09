import { prisma } from '../../../utils/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const absences = await prisma.absence.findMany({
      select: {
        id: true,
        lessonDate: true,
        subject: true,
        lessonPlan: true,
        reasonOfAbsence: true,
        absentTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        substituteTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!absences.length) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const extractTimeArray = function (date: Date) {
      return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
      ];
    };

    const events = absences.map((absence) => {
      const attendees = [
        {
          name: `${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName}`,
          email: absence.absentTeacher.email,
          rsvp: true,
          partstat: 'TENTATIVE',
          role: 'OPT-PARTICIPANT',
        },
      ];

      if (absence.substituteTeacher) {
        attendees.push({
          name: `${absence.substituteTeacher.firstName} ${absence.substituteTeacher.lastName}`,
          email: absence.substituteTeacher.email,
          rsvp: true,
          partstat: 'TENTATIVE',
          role: 'REQ-PARTICIPANT',
        });
      }

      return {
        start: extractTimeArray(absence.lessonDate),
        duration: { hours: 2, minutes: 30 },
        title: `${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName}'s ${absence.subject}`,
        description:
          'For issues regarding unclaiming absences and lesson plans, please contact admin',
        location: absence.location.name,
        url: absence.lessonPlan,
        categories: [absence.subject],
        status: 'TENTATIVE',
        organizer: {
          name: 'Sistema Toronto',
          email: 'sistema@uwblueprint.org',
        },
        attendees: attendees,
      };
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/getAbsences:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
