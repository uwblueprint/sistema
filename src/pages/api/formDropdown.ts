import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const subjects = await prisma.subject.findMany({
        select: { id: true, name: true },
      });

      const locations = await prisma.location.findMany({
        select: { id: true, name: true },
      });

      const subjectMap: Record<number, { id: number; name: string }> = {};
      subjects.forEach((subject) => {
        subjectMap[subject.id] = subject;
      });
      const subjectOptions = Object.values(subjectMap).map((subject) => ({
        name: `${subject.name}`,
        id: subject.id,
      }));

      const locationMap: Record<number, { id: number; name: string }> = {};
      locations.forEach((location) => {
        locationMap[location.id] = location;
      });
      const locationOptions = Object.values(locationMap).map((location) => ({
        name: `${location.name}`,
        id: location.id,
      }));

      res.status(200).json({
        subjectOptions,
        locationOptions,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch form dropdown data',
        message: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
