import { prisma } from '@utils/prisma';

export interface AbsenceWithRelations {
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  notes: string | null;
  roomNumber: string | null;
  absentTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  };
  substituteTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  location: {
    name: string;
    abbreviation: string;
  };
  subject: {
    name: string;
    abbreviation: string;
  };
}

export const getAbsencesFromDatabase = async (): Promise<
  AbsenceWithRelations[]
> => {
  try {
    const absences: AbsenceWithRelations[] = await prisma.absence.findMany({
      select: {
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
