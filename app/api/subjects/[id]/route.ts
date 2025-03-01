import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const { name, abbreviation, colorGroupId, archived } = data;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        abbreviation,
        colorGroupId,
        archived,
      },
      include: {
        colorGroup: true,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if the subject is used in any absences
    const absenceUsingSubject = await prisma.absence.findFirst({
      where: { subjectId: id },
      select: { id: true }, // Only select the ID field for efficiency
    });

    if (absenceUsingSubject) {
      return NextResponse.json(
        {
          error:
            'Cannot delete subject because it is used in existing absences',
        },
        { status: 409 } // Conflict seems like the best status code for this
      );
    }

    await prisma.subject.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
