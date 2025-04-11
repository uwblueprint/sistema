import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const getMailingLists = searchParams.get('getMailingLists') === 'true';
  const getAbsences = searchParams.get('getAbsences') === 'true';

  try {
    const users = await prisma.user.findMany({
      include: {
        mailingLists: getMailingLists
          ? {
              include: {
                subject: {
                  select: {
                    name: true,
                    abbreviation: true,
                    colorGroup: {
                      select: { colorCodes: true },
                    },
                  },
                },
              },
            }
          : false,
        absences: getAbsences,
      },
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
