import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export interface Location {
  id: number;
  name: string;
  abbreviation: string;
}

export async function GET() {
  try {
    const locations: Location[] = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
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
