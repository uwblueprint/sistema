import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    const newAbsence = await prisma.absence.create({
      data: {
        lessonDate: new Date(body.lessonDate),
        lessonPlan: body.lessonPlan || null,
        reasonOfAbsence: body.reasonOfAbsence,
        notes: body.notes || null,
        absentTeacherId: body.absentTeacherId,
        substituteTeacherId: body.substituteTeacherId || null,
        locationId: body.locationId,
        subjectId: body.subjectId,
        roomNumber: body.roomNumber || null,
      },
    });

    return NextResponse.json(newAbsence, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/addAbsence:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
