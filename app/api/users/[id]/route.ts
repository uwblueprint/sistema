import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

function validateId(id: string): number | null {
  const parsedId = Number(id);
  return Number.isNaN(parsedId) ? null : parsedId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = validateId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const getAbsences = searchParams.get('getAbsences') === 'true';

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { absences: getAbsences },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = validateId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const { email, firstName, lastName, role, status } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, firstName, lastName, role, status },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
