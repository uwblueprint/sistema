import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const params = req.query;
    const getAbsences = params.getAbsences === 'true';
    const id = Number(params.id as string);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID provided' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { absences: getAbsences },
      });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const data = req.body;
    const id = Number(req.query.id as string);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID provided' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: data.status,
        },
      });

      if (!updatedUser) {
        return res.status(400).json({ error: 'User not found' });
      }

      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
