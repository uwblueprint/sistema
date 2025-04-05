import { prisma } from '@utils/prisma';
import { AbsenceAPI } from '@utils/types';

function formDBQuery(fromYear?: number, toYear?: number) {
  const baseQuery = {
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
          profilePicture: true,
        },
      },
      substituteTeacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
  };

  const hasProvidedDateRange = Boolean(fromYear && toYear);
  if (!hasProvidedDateRange) return baseQuery;

  const isValidDateRange =
    Number.isInteger(fromYear) &&
    Number.isInteger(toYear) &&
    Number(toYear) - Number(fromYear) === 1;

  if (!isValidDateRange) {
    throw new Error(`${fromYear} to ${toYear} is an invalid date range.`);
  }

  const firstDayOfYear = new Date(`${fromYear}-01-01T00:00:00.000Z`);
  const lastDayOfYear = new Date(`${fromYear}-12-31T23:59:59.999Z`);

  return {
    ...baseQuery,
    where: {
      lessonDate: {
        gte: firstDayOfYear,
        lte: lastDayOfYear,
      },
    },
  };
}

export const getAbsencesFromDatabase = async (
  fromYear?: number,
  toYear?: number
): Promise<AbsenceAPI[]> => {
  try {
    const query = formDBQuery(fromYear, toYear);
    const absences = await prisma.absence.findMany(query);
    return absences;
  } catch (err) {
    console.error('Error fetching absences:', err);
    throw err;
  }
};
