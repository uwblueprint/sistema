import { deleteDriveFile } from '@utils/googleDrive';
import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, lessonPlanFile, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing absence ID' },
        { status: 400 }
      );
    }

    const updatedAbsence = await prisma.$transaction(async (tx) => {
      const existing = await tx.absence.findUnique({
        where: { id },
        include: { lessonPlan: true },
      });

      if (!existing) {
        throw new Error(`Absence with ID ${id} not found.`);
      }

      const dataToUpdate: any = {};
      if ('lessonDate' in fields)
        dataToUpdate.lessonDate = new Date(fields.lessonDate);
      if ('reasonOfAbsence' in fields)
        dataToUpdate.reasonOfAbsence = fields.reasonOfAbsence;
      if ('notes' in fields) dataToUpdate.notes = fields.notes || null;
      if ('absentTeacherId' in fields)
        dataToUpdate.absentTeacherId = fields.absentTeacherId;
      if ('substituteTeacherId' in fields)
        dataToUpdate.substituteTeacherId = fields.substituteTeacherId || null;
      if ('locationId' in fields) dataToUpdate.locationId = fields.locationId;
      if ('subjectId' in fields) dataToUpdate.subjectId = fields.subjectId;
      if ('roomNumber' in fields)
        dataToUpdate.roomNumber = fields.roomNumber || null;

      if (lessonPlanFile) {
        if (existing.lessonPlanId && existing.lessonPlan) {
          const maybeFileId = existing.lessonPlan.url
            .split('/d/')[1]
            ?.split('/')[0];
          if (maybeFileId) {
            await deleteDriveFile(maybeFileId);
          }

          await tx.absence.update({
            where: { id },
            data: { lessonPlanId: null },
          });
          await tx.lessonPlanFile.delete({
            where: { id: existing.lessonPlanId },
          });
        }

        const newLessonPlan = await tx.lessonPlanFile.create({
          data: {
            name: lessonPlanFile.name,
            url: lessonPlanFile.url,
            size: lessonPlanFile.size,
          },
        });
        dataToUpdate.lessonPlanId = newLessonPlan.id;
      }

      const updated = await tx.absence.update({
        where: { id },
        data: dataToUpdate,
      });

      return updated;
    });

    return NextResponse.json(updatedAbsence, { status: 200 });
  } catch (err: any) {
    console.error('Error in PUT /api/editAbsence:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
