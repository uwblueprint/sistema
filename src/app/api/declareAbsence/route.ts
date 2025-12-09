import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      lessonDate,
      reasonOfAbsence,
      notes,
      absentTeacherId,
      substituteTeacherId,
      locationId,
      subjectId,
      roomNumber,
      lessonPlanFile,
    } = body;

    if (
      !lessonDate ||
      !reasonOfAbsence ||
      !absentTeacherId ||
      !locationId ||
      !subjectId
    ) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newAbsence = await prisma.$transaction(async (prisma) => {
      let lessonPlanId: number | null = null;

      if (lessonPlanFile) {
        const lessonPlan = await prisma.lessonPlanFile.create({
          data: {
            name: lessonPlanFile.name,
            url: lessonPlanFile.url,
            size: lessonPlanFile.size,
          },
        });
        lessonPlanId = lessonPlan.id;
      }

      const absence = await prisma.absence.create({
        data: {
          lessonDate: new Date(lessonDate),
          lessonPlanId,
          reasonOfAbsence: reasonOfAbsence,
          notes: notes || null,
          absentTeacherId: absentTeacherId,
          substituteTeacherId: substituteTeacherId || null,
          locationId: locationId,
          subjectId: subjectId,
          roomNumber: roomNumber || null,
        },
      });

      return absence;
    });

    return NextResponse.json(newAbsence, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/declareAbsence:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
