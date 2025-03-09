import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';
import { SubjectAPI } from '@utils/types';

export async function GET() {
  try {
    const subjects: SubjectAPI[] = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        colorGroupId: true,
        colorGroup: {
          select: {
            name: true,
            colorCodes: true,
          },
        },
      },
      where: {
        archived: false,
      },
    });

    if (!subjects.length) {
      return NextResponse.json({ subjects: [] }, { status: 200 });
    }

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/subjects:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
