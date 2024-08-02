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

  const id = Number(params.params.id);

  if (Number.isNaN(id)) {
    return new NextResponse('ID not a number', { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { absences: getAbsences },
    });

    console.log(user);

    if (!user) {
      return new NextResponse('User not found', { status: 400 });
    } else {
      return new NextResponse(JSON.stringify(user), { status: 200 });
    }
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest, params) {
  // DATA UPDATED
  const data = await req.json();
  const email = data['email'];
  const firstName = data['firstName'];
  const lastName = data['lastName'];
  const role = data['role'];
  const status = data['status'];

  const updatedData = {
    email: email,
    firstName: firstName,
    lastName: lastName,
    role: role,
    status: status,
  };

  console.log(updatedData);

  // ID
  if (!params || !params.params || !params.params.id) {
    return new NextResponse('Invalid id provided', { status: 400 });
  }

  const id = Number(params.params.id);

  if (Number.isNaN(id)) {
    return new NextResponse('ID not a number', { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

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

export async function DELETE(req: NextRequest, params) {
  // ID
  if (!params || !params.params || !params.params.id) {
    return new NextResponse('Invalid id provided', { status: 400 });
  }

  const id = Number(params.params.id);

  if (Number.isNaN(id)) {
    return new NextResponse('ID not a number', { status: 400 });
  }

  try {
    const user = await prisma.user.delete({
      where: { id },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 400 });
    } else {
      return new NextResponse('User with id' + id + 'deleted', { status: 200 });
    }
  } catch (error) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
