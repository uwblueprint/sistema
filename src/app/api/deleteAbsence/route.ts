import { deleteDriveFile } from '@utils/googleDrive';
import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const absenceId = parseInt(body.absenceId, 10);

    if (isNaN(absenceId)) {
      return NextResponse.json(
        { message: 'Invalid absence ID' },
        { status: 400 }
      );
    }

    const absence = await prisma.absence.findUnique({
      where: { id: absenceId },
      include: {
        lessonPlan: true,
        absentTeacher: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!absence) {
      return NextResponse.json(
        { message: 'Absence not found' },
        { status: 404 }
      );
    }

    if (absence.lessonPlan) {
      const fileId = absence.lessonPlan.url.split('/d/')[1]?.split('/')[0];
      if (fileId) {
        await deleteDriveFile(fileId);
      }
    }

    await prisma.absence.delete({
      where: { id: absenceId },
    });

    return NextResponse.json(
      { message: 'Absence deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting absence:', error);
    return NextResponse.json(
      { message: 'Failed to delete absence', error: error.message },
      { status: 500 }
    );
  }
}
