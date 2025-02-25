import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

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
    const data = await request.json();
    const { name, abbreviation } = data;

    const location = await prisma.location.create({
      data: {
        name,
        abbreviation,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
