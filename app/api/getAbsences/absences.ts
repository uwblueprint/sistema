import { prisma } from '@utils/prisma';
import { AbsenceAPI } from '@utils/types';

export const getAbsencesFromDatabase = async (): Promise<AbsenceAPI[]> => {
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
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        substituteTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            archived: true,
          },
        },

        subject: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            archived: true,
            colorGroup: {
              select: {
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
