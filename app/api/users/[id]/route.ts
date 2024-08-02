import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, params) {
  // GETABSENCES
  const { searchParams } = new URL(req.url);
  const encodedAbsences = searchParams.get('getAbsences');
  let getAbsences = false;
  if (encodedAbsences) {
    getAbsences = Boolean(decodeURIComponent(encodedAbsences));
  }

  // ID
  if (!params || !params.params || !params.params.id) {
    return new NextResponse('Invalid id provided', { status: 400 });
  }

  const id = params.params.id;

  if (Number.isNaN(id)) {
    return new NextResponse('ID not a number', { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { absences: getAbsences },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 400 });
    } else {
      return new NextResponse(JSON.stringify(user), { status: 200 });
    }
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
