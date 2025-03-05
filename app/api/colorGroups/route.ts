import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET() {
  try {
    const colorGroups = await prisma.colorGroup.findMany();
    return NextResponse.json(colorGroups);
  } catch (error) {
    console.error('Error fetching color groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
