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

  // EMAIL
  if (!params || !params.params || !params.params.email) {
    return new NextResponse('Invalid email provided', { status: 400 });
  }

  // TODO: rename realEmail to email to be used in the findUnique later
  const realEmail = params.params.email;
  console.log('url email:' + realEmail);

  try {
    // TODO: remove once emails are set up
    // fake stuff begins
    // find random email in db for now
    const fakeEmailReq = await prisma.user.findFirst({
      select: {
        email: true,
      },
    });
    console.log(fakeEmailReq);
    let email;
    if (!fakeEmailReq) {
      return new NextResponse('DEV ERROR: local db not seeded!', {
        status: 400,
      });
    } else {
      email = fakeEmailReq.email;
    }
    console.log('fake db email: ' + email);
    // fake stuff ends

    const user = await prisma.user.findUnique({
      where: { email },
      include: { absences: getAbsences },
    });

    console.log(user);

    if (!user) {
      return new NextResponse('User not found', { status: 400 });
    } else {
      return new NextResponse(JSON.stringify(user), { status: 200 });
    }
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
