import { prisma } from '../../../utils/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Check for absence ID - required for updates
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing absence ID' },
        { status: 400 }
      );
    }

    // Check for required fields
    if (
      !body.lessonDate ||
      !body.reasonOfAbsence ||
      !body.absentTeacherId ||
      !body.locationId ||
      !body.subjectId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the existing absence
    const updatedAbsence = await prisma.absence.update({
      where: {
        id: body.id,
      },
      data: {
        lessonDate: new Date(body.lessonDate),
        lessonPlan: body.lessonPlan || null,
        reasonOfAbsence: body.reasonOfAbsence,
        notes: body.notes || null,
        absentTeacherId: body.absentTeacherId,
        substituteTeacherId: body.substituteTeacherId || null,
        locationId: body.locationId,
        subjectId: body.subjectId,
      },
    });

    return NextResponse.json(updatedAbsence, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/editAbsence:', err.message || err);

    // Handle case when absence with given ID doesn't exist
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Absence not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
