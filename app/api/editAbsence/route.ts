import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
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

    console.log(body);

    if (
      !id ||
      !lessonDate ||
      !reasonOfAbsence ||
      !absentTeacherId ||
      !locationId ||
      !subjectId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedAbsence = await prisma.$transaction(async (prisma) => {
      let lessonPlanId: number | undefined;

      if (lessonPlanFile) {
        const existing = await prisma.absence.findUnique({
          where: { id },
          include: { lessonPlan: true },
        });

        if (existing?.lessonPlanId) {
          await prisma.lessonPlanFile.delete({
            where: { id: existing.lessonPlanId },
          });
        }

        const lessonPlan = await prisma.lessonPlanFile.create({
          data: {
            name: lessonPlanFile.name,
            url: lessonPlanFile.url,
            size: lessonPlanFile.size,
          },
        });

        lessonPlanId = lessonPlan.id;
      }

      const dataToUpdate: any = {
        lessonDate: new Date(lessonDate),
        reasonOfAbsence,
        notes: notes || null,
        absentTeacherId,
        substituteTeacherId: substituteTeacherId || null,
        locationId,
        subjectId,
        roomNumber: roomNumber || null,
      };

      if (lessonPlanId !== undefined) {
        dataToUpdate.lessonPlanId = lessonPlanId;
      }

      const absence = await prisma.absence.update({
        where: { id },
        data: dataToUpdate,
      });

      return absence;
    });

    return NextResponse.json(updatedAbsence, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/editAbsence:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
