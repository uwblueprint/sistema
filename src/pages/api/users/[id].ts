import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = Number(req.query.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  if (req.method === 'GET') {
    const getAbsences = req.query.getAbsences === 'true';

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { absences: getAbsences },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const { email, firstName, lastName, role, status } = req.body;
    const id = Number(req.query.id as string);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID provided' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { email, firstName, lastName, role, status },
      });

      if (!updatedUser) {
        return res.status(400).json({ error: 'User not found' });
      }

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
