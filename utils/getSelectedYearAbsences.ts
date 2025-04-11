export const getSelectedYearAbsences = (
  absences: { lessonDate: string }[] = [],
  selectedYearRange: string
): number => {
  if (!absences || !selectedYearRange) return 0;

  const [startYear] = selectedYearRange
    .split(' - ')
    .map((year) => parseInt(year, 10));
  const endYear = startYear + 1;

  return absences.filter((absence) => {
    const absenceDate = new Date(absence.lessonDate);
    const month = absenceDate.getMonth();
    const year = absenceDate.getFullYear();

    return (
      (year === startYear && month >= 8) || (year === endYear && month < 8)
    );
  }).length;
};
