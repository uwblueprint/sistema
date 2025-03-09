import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';
import { Location } from '@utils/types';

export async function GET() {
  try {
    const locations: Location[] = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        archived: false,
      },
      where: {
        archived: false,
      },
    });

    if (!locations.length) {
      return NextResponse.json({ locations: [] }, { status: 200 });
    }

    return NextResponse.json({ locations }, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/locations:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
