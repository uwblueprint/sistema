import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@utils/prisma';

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findFirst();

    if (!settings) {
      // If no settings exist, this is an error
      return NextResponse.json(
        { error: 'No global settings found' },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the input
    if (typeof data.absenceCap !== 'number' || data.absenceCap < 0) {
      return NextResponse.json(
        { error: 'Invalid absenceCap value' },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.globalSettings.upsert({
      where: {
        // Since we only have one settings record, we can use id: 1
        id: 1,
      },
      update: {
        absenceCap: data.absenceCap,
      },
      create: {
        absenceCap: data.absenceCap,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating global settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
