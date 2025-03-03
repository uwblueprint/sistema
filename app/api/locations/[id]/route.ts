import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const { name, abbreviation, archived } = data;

    const location = await prisma.location.update({
      where: { id },
      data: { name, abbreviation, archived },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Check if the location is used in any absences
    const absenceUsingLocation = await prisma.absence.findFirst({
      where: { locationId: id },
      select: { id: true }, // Only select the ID field for efficiency
    });

    if (absenceUsingLocation) {
      return NextResponse.json(
        {
          error:
            'Cannot delete location because it is used in existing absences',
        },
        { status: 409 }
      );
    }

    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
