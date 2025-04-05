import { NextResponse } from 'next/server';
import { prisma } from '../../../utils/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const absenceId = parseInt(body.absenceId);
    const userId = parseInt(body.userId);

    // Check if the ID is valid
    if (isNaN(absenceId) || absenceId === undefined) {
      return NextResponse.json(
        { message: 'Invalid absence ID' },
        { status: 400 }
      );
    }

    const updatedAbsence = await prisma.absence.update({
      where: { id: absenceId },
      data: { substituteTeacherId: userId },
    });

    return NextResponse.json(updatedAbsence, { status: 200 });
  } catch (error) {
    console.error('Error claiming absence:', error);
    return NextResponse.json(
      { message: 'Failed to claim absence' },
      { status: 500 }
    );
  }
}
