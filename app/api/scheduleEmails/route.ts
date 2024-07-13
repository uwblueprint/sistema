import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function GET(req: NextRequest) {
  try {
    console.log('hi');
    const today = new Date();
    const twoDaysFromNow = today.setDate(today.getDate() + 2);
    const sevenDaysFromNow = today.setDate(today.getDate() + 7);
    const absences = await prisma.absence.findMany({
      where: {
        OR: [
          { lessonDate: new Date(twoDaysFromNow) },
          { lessonDate: new Date(sevenDaysFromNow) },
        ],
        // date is 2 or seven days from now
      },
    });

    return NextResponse.json({ status: 200, body: { absences } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      status: 500,
      body: { error: 'Internal Server Error' },
    });
  }
}
