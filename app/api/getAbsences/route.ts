import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
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
    const absences = await prisma.absence.findMany();
    return NextResponse.json({ status: 200, body: { absences } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      status: 500,
      body: { error: 'Internal Server Error' },
    });
  }
}

// const prisma = new PrismaClient()

// export default async function handle(req,res) {
//   const Absences = await prisma.absence.findMany()
//   res.json(Absences)
// }
