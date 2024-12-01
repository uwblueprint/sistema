import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const primsa = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == 'GET') {
    try {
      const locations = await primsa.location.findMany();
      res.status(200).json({ locations });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'failed to fetch locations', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
