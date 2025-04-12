import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const locations = await prisma.location.findMany();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, abbreviation } = (await request.json()) ?? {};

    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        abbreviation: abbreviation || '',
      },
    });
    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      {
        error: 'Unable to create location.',
      },
      { status: 500 }
    );
  }
}
