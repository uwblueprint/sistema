import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

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

    const existingSettings = await prisma.globalSettings.findFirst();

    let updatedSettings;
    if (existingSettings) {
      updatedSettings = await prisma.globalSettings.update({
        where: { id: existingSettings.id },
        data: { absenceCap: data.absenceCap },
      });
    } else {
      updatedSettings = await prisma.globalSettings.create({
        data: { absenceCap: data.absenceCap },
      });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating global settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
