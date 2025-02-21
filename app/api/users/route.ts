import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const getAbsences = searchParams.get('getAbsences') === 'true';

    const users = await prisma.user.findMany({
      include: { absences: getAbsences },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
