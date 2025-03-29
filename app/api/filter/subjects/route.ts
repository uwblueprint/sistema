import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { SubjectAPI } from '@utils/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const archivedParam = searchParams.get('archived');

    let archivedFilter: boolean | undefined = undefined;
    if (archivedParam === 'true') archivedFilter = true;
    if (archivedParam === 'false') archivedFilter = false;

    const subjects: SubjectAPI[] = await prisma.subject.findMany({
      where: archivedFilter !== undefined ? { archived: archivedFilter } : {},
      select: {
        id: true,
        name: true,
        archived: true,
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

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/subjects:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
