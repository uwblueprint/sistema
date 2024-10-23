import { PrismaClient } from '@prisma/client';
import { NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req, res: NextApiResponse) {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
}
