import { Prisma, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
const prisma = new PrismaClient();

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
    // TODO: Please see https://www.notion.so/uwblueprintexecs/Teacher-Profile-Popup-Frontend-0e847ff1bef04037afd2b4d104875afa?pvs=4
    const useFake = true;
    let email;
    if (useFake) {
      // random email from DB
      const randomUser = await getRandomUser();
      email = randomUser.email;
    } else {
      email = realEmail;
    }

    // get the user from the DB
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { absences: shouldIncludeAbsences },
    });

    res.status(200).json(user);
  } catch (error) {
    // if the find first query (for finding a random user email) failed
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      res.status(400).json({ error: 'Database is empty or user not found.' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
