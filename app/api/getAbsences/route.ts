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
            abbreviation: true,
          },
        },
      },
    });

    if (!absences.length) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const events = absences.map((absence) => {
      function extractTimeArray(date: Date, offset = 0) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + offset);
        return [
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          newDate.getDate(),
        ];
      }
      if (absence?.substituteTeacher) {
        var substituteTeacherString = `(${absence.substituteTeacher?.firstName} ${absence.substituteTeacher?.lastName[0]})`;
      } else {
        var substituteTeacherString = '';
      }

      if (absence?.lessonPlan) {
        var lessonString = absence.lessonPlan;
      } else {
        var lessonString = 'Lesson Plan Not Submitted.';
      }

      return {
        start: extractTimeArray(absence.lessonDate),
        end: extractTimeArray(absence.lessonDate, 1),
        title:
          `${absence.subject.abbreviation}: ${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName[0]}` +
          substituteTeacherString,
        description: `Subject: ${absence.subject.name}\nLesson Plan: ${lessonString}`,
        location: absence.location.name,
      };
    });
    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/getAbsences:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
