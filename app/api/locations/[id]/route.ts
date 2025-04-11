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
        { error: 'Invalid location ID' },
        { status: 400 }
      );
    }

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
      {
        error:
          'Unable to update location. Please try again or contact support.',
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
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Check if the location is used in any absences
    const absenceUsingLocation = await prisma.absence.findFirst({
      where: { locationId: id },
      select: { id: true },
    });

    if (absenceUsingLocation) {
      return NextResponse.json(
        {
          error:
            'This location cannot be deleted because it is used in existing absences',
        },
        { status: 409 }
      );
    }

    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      {
        error:
          'Unable to delete location. Please try again or contact support.',
      },
      { status: 500 }
    );
  }
}
