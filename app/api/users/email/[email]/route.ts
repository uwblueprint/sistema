// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma';

async function getRandomUser() {
  const user = await prisma.user.findFirstOrThrow({
    select: {
      email: true,
    },
  });
  return user;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shouldIncludeAbsences =
    searchParams.get('shouldIncludeAbsences') === 'true';
  const realEmail = searchParams.get('email');

  try {
    const useFake = true;
    let email: string;
    if (useFake) {
      const randomUser = await getRandomUser();
      email = randomUser.email;
    } else {
      email = realEmail!;
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { absences: shouldIncludeAbsences },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Database is empty or user not found.' },
        { status: 400 }
      );
    }
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
