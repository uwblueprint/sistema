import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query;
  const getMailingLists = params.getMailingLists === 'true';

  try {
    const users = await prisma.user.findMany({
      include: {
        mailingLists: getMailingLists
          ? {
              include: {
                mailingList: true,
              },
            }
          : false,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
