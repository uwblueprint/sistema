import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const { name, abbreviation, colorGroupId } = data;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        abbreviation,
        colorGroupId,
      },
      include: {
        colorGroup: true,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    await prisma.subject.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
