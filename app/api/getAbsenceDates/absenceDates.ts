import { prisma } from '@utils/prisma';
import { MonthlyAbsenceData, YearlyAbsenceData } from '@utils/types';

export const getAbsenceYearRanges = async (): Promise<YearlyAbsenceData[]> => {
  try {
    const absences = await prisma.absence.findMany({
      select: {
        lessonDate: true,
        substituteTeacherId: true,
      },
    });

    const monthLabels = [
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
    ];
    const absenceMap = new Map<string, MonthlyAbsenceData[]>();

    absences.forEach(({ lessonDate, substituteTeacherId }) => {
      const date = new Date(lessonDate);
      const month = date.getMonth();
      const startYear =
        month >= 8 ? date.getFullYear() : date.getFullYear() - 1;
      const yearRange = `${startYear} - ${startYear + 1}`;
      const monthLabel = monthLabels[(month + 4) % 12];

      if (!absenceMap.has(yearRange)) {
        absenceMap.set(
          yearRange,
          monthLabels.map((m) => ({ month: m, filled: 0, unfilled: 0 }))
        );
      }

      const yearlyData = absenceMap.get(yearRange)!;
      const monthData = yearlyData.find((m) => m.month === monthLabel)!;

      if (substituteTeacherId) {
        monthData.filled++;
      } else {
        monthData.unfilled++;
      }
    });

    return Array.from(absenceMap, ([yearRange, yearlyData]) => ({
      yearRange,
      yearlyData,
    }));
  } catch (err) {
    console.error('Error fetching absences:', err);
    throw err;
  }
};
