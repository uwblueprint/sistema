import { NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true },
    });

    const locations = await prisma.location.findMany({
      select: { id: true, name: true },
    });

    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true },
    });

    const subjectOptions = subjects.map((subject) => ({
      name: subject.name,
      id: subject.id,
    }));

    const locationOptions = locations.map((location) => ({
      name: location.name,
      id: location.id,
    }));

    const userOptions = users.map((user) => ({
      name: `${user.firstName} ${user.lastName}`,
      id: user.id,
    }));

    return NextResponse.json({
      subjectOptions,
      locationOptions,
      userOptions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch form dropdown data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
