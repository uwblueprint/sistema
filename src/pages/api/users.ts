import { NextApiResponse } from 'next';
import { prisma } from '../../../utils/prisma';

export default async function handler(req, res: NextApiResponse) {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
}
