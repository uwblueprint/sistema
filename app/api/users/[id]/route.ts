import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

function validateId(id: string): number | null {
  const parsedId = Number(id);
  return Number.isNaN(parsedId) ? null : parsedId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const validatedId = validateId(id);
  if (validatedId === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const getAbsences = searchParams.get('getAbsences') === 'true';

  try {
    const user = await prisma.user.findUnique({
      where: { id: validatedId },
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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const validatedId = validateId(id);
  if (validatedId === null) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const { email, firstName, lastName, role } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: validatedId },
      data: { email, firstName, lastName, role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
