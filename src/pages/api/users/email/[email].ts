import { Prisma } from '@prisma/client';
import { prisma } from '../../../../../utils/prisma';

import type { NextApiRequest, NextApiResponse } from 'next';

async function getRandomUser() {
  const user = await prisma.user.findFirstOrThrow({
    select: {
      email: true,
    },
  });
  return user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query;
  const shouldIncludeAbsences = params.shouldIncludeAbsences === 'true';
  const realEmail = params.email as string;
  try {
    const useFake = true;
    let email: string;
    if (useFake) {
      const randomUser = await getRandomUser();
      email = randomUser.email;
    } else {
      email = realEmail;
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { absences: shouldIncludeAbsences },
    });

    return res.status(200).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res
        .status(400)
        .json({ error: 'Database is empty or user not found.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
