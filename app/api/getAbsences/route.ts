import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { availableParallelism } from 'os';
import { EventAttributes } from 'ics';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function GET(req: NextRequest) {
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
            // Add any other fields you need from the User model
          },
        },
        substituteTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            // Add any other fields you need from the User model
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            // Add any other fields you need from the Location model
          },
        },
      },
    });

    const extractTimeArray = function(date: Date) {
      return [date.getFullYear(), date.getMonth(), date.getDay(), date.getHours(), date.getMinutes()];
    }

    const events = absences.map((absence) => {
      const attendees = [
        {
          name:
            absence.absentTeacher.firstName +
            ' ' +
            absence.absentTeacher.lastName,
          email: absence.absentTeacher.email,
          rsvp: true,
          partstat: 'TENTATIVE',
          role: 'OPT-PARTICIPANT',
        },
      ];

      if (absence.substituteTeacher) {
        attendees.push({
          name:
            absence.substituteTeacher.firstName +
            ' ' +
            absence.substituteTeacher.lastName,
          email: absence.substituteTeacher.email,
          rsvp: true,
          partstat: 'TENTATIVE',
          role: 'REQ-PARTICIPANT',
        });
      }

      return {
        // start: [2024, 7, 8, 12, 15],
        start: absence.lessonDate.getTime(),
        duration: { hours: 2, minutes: 30 },
        title:
          absence.absentTeacher.firstName +
          ' ' +
          absence.absentTeacher.lastName +
          "'s " +
          absence.subject,
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




    return NextResponse.json({ status: 200, body: { events } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      status: 500,
      body: { error: 'Internal Server Error' },
    });
  }
}

// const prisma = new PrismaClient()

// export default async function handle(req,res) {
//   const Absences = await prisma.absence.findMany()
//   res.json(Absences)
// }
