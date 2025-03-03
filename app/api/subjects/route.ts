import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET() {
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

export async function POST(request: NextRequest) {
  try {
    const { name, abbreviation, colorGroupId } = await request.json();
    if (!name || !abbreviation || !colorGroupId) {
      return NextResponse.json(
        { error: 'name, abbreviation, and colorGroupId are required' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        abbreviation,
        colorGroupId,
      },
      include: {
        colorGroup: true,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
