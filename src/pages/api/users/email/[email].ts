import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query;
  const encodedAbsences = params.getAbsences as string;
  let getAbsences = false;
  if (encodedAbsences) {
    getAbsences = Boolean(encodedAbsences);
  }
  // TODO: rename realEmail to email to be used in the findUnique later
  const realEmail = params.email as string;

  try {
    // TODO: remove block once emails are set up
    // fake stuff begins
    // find random email in db for now
    const useFake = true;
    const fakeEmailReq = await prisma.user.findFirst({
      select: {
        email: true,
      },
    });
    let email;
    if (!fakeEmailReq) {
      res.status(400).json({ error: 'Database is empty' });
    } else {
      email = useFake ? fakeEmailReq.email : realEmail;
    }
    // fake stuff ends

    const user = await prisma.user.findUnique({
      where: { email },
      include: { absences: getAbsences },
    });

    if (!user) {
      res.status(400).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
