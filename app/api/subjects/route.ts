import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET(request: NextRequest) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        colorGroup: true,
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
