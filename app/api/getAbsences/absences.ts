import { prisma } from '@utils/prisma';
import { AbsenceWithRelations } from '@utils/types';

export const getAbsencesFromDatabase = async (): Promise<
  AbsenceWithRelations[]
> => {
  try {
    const absences = await prisma.absence.findMany({
      select: {
        id: true,
        lessonDate: true,
        lessonPlan: true,
        reasonOfAbsence: true,
        notes: true,
        roomNumber: true,
        absentTeacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        substituteTeacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
        subject: {
          select: {
            name: true,
            abbreviation: true,
            colorGroup: {
              select: {
                name: true,
                colorCodes: true,
              },
            },
          },
        },
      },
    });

    return absences;
  } catch (err) {
    console.error('Error fetching absences:', err);
    throw err;
  }
};
