import { NextResponse } from 'next/server';
import { prisma } from '../../../utils/prisma';

// For DELETE requests
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const absenceId = parseInt(body.absenceId);

    // Check if the ID is valid
    if (isNaN(absenceId) || absenceId === undefined) {
      return NextResponse.json(
        { message: 'Invalid absence ID' },
        { status: 400 }
      );
    }

    const absence = await prisma.absence.findUnique({
      where: { id: absenceId },
      include: {
        absentTeacher: true,
      },
    });

    if (!absence) {
      return NextResponse.json(
        { message: 'Absence not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const isAdmin = body.isUserAdmin;

    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Delete the absence record
    await prisma.absence.delete({
      where: { id: absenceId },
    });

    return NextResponse.json(
      { message: 'Absence deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting absence:', error);
    return NextResponse.json(
      { message: 'Failed to delete absence' },
      { status: 500 }
    );
  }
}
