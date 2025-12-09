import { prisma } from '@utils/prisma';
import { Location } from '@utils/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const archivedParam = searchParams.get('archived');

    let archivedFilter: boolean | undefined = undefined;
    if (archivedParam === 'true') archivedFilter = true;
    if (archivedParam === 'false') archivedFilter = false;

    const locations: Location[] = await prisma.location.findMany({
      where: archivedFilter !== undefined ? { archived: archivedFilter } : {},
      select: {
        id: true,
        name: true,
        abbreviation: true,
        archived: true,
      },
    });

    return NextResponse.json({ locations }, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/locations:', err.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
