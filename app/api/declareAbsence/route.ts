import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    if (
      !body.lessonDate ||
      !body.reasonOfAbsence ||
      !body.absentTeacherId ||
      !body.locationId ||
      !body.subjectId
    ) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newAbsence = await prisma.$transaction(async (prisma) => {
      let lessonPlanId: number | null = null;

      if (body.lessonPlanFile) {
        const lessonPlan = await prisma.lessonPlanFile.create({
          data: {
            name: body.lessonPlanFile.name,
            url: body.lessonPlanFile.url,
            size: body.lessonPlanFile.size,
          },
        });
        lessonPlanId = lessonPlan.id;
      }

      const absence = await prisma.absence.create({
        data: {
          lessonDate: new Date(body.lessonDate),
          lessonPlanId,
          reasonOfAbsence: body.reasonOfAbsence,
          notes: body.notes || null,
          absentTeacherId: body.absentTeacherId,
          substituteTeacherId: body.substituteTeacherId || null,
          locationId: body.locationId,
          subjectId: body.subjectId,
          roomNumber: body.roomNumber || null,
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
