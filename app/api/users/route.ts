import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const getMailingLists = searchParams.get('getMailingLists') === 'true';

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
                    colorGroupId: true,
                  },
                },
              },
            }
          : false,
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
