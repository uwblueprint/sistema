import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { name, abbreviation, colorGroupId, archived } = data;

    const subject = await prisma.subject.update({
      where: { id },
      data: { name, abbreviation, colorGroupId, archived },
      include: {
        colorGroup: true,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      {
        error: 'Unable to update subject.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Check if the subject is used in any absences
    const absenceUsingSubject = await prisma.absence.findFirst({
      where: { subjectId: id },
      select: { id: true },
    });

    if (absenceUsingSubject) {
      return NextResponse.json(
        {
          error:
            'This subject cannot be deleted because it is used in existing absences',
        },
        { status: 409 }
      );
    }

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      {
        error: 'Unable to delete subject.',
      },
      { status: 500 }
    );
  }
}
