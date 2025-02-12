import { prisma } from '@utils/prisma';
import { NextResponse } from 'next/server';

export interface SubjectWithColorGroup {
  id: number;
  name: string;
  abbreviation: string;
  colorGroupId: number;
  colorGroup: {
    name: string;
    colorCodes: string[];
  };
}

export async function GET() {
  try {
    const subjects: SubjectWithColorGroup[] = await prisma.subject.findMany({
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
