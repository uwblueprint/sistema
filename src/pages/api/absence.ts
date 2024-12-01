import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const absences = await prisma.absence.findMany({
        include: {
          subject: true,
          location: true,
        },
      });
      res.status(200).json({ absences });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch absences', message: error.message });
    }
  } else if (req.method === 'POST') {
    const {
      lessonDate,
      lessonPlan,
      reasonOfAbsence,
      absentTeacherId,
      substituteTeacherId,
      locationId,
      subjectId,
      notes,
    } = req.body;
    try {
      const newAbsence = await prisma.absence.create({
        data: {
          lessonDate,
          lessonPlan,
          reasonOfAbsence,
          absentTeacherId,
          substituteTeacherId,
          locationId,
          subjectId,
          notes,
        },
      });

      res.status(200).json({ newAbsence });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to add absence', message: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      await prisma.absence.delete({
        where: { id },
      });
      res.status(200).json({ message: 'Absence deleted' });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to delete absence', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
