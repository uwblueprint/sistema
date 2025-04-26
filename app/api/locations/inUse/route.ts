import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Find all locations that are used in any absences
    const locationsInUse = await prisma.absence.findMany({
      select: {
        locationId: true,
      },
      distinct: ['locationId'],
      where: {
        locationId: {
          not: undefined,
        },
      },
    });

    // Extract the location IDs and filter out any null values
    const locationIds = locationsInUse
      .map((absence) => absence.locationId)
      .filter((id): id is number => id !== null && id !== undefined);

    return NextResponse.json({ locationsInUse: locationIds });
  } catch (error) {
    console.error('Error checking locations in use:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
