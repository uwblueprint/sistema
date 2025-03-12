export const getAbsenceColor = (absences: number, cap: number): string => {
  const ratio = absences / cap;
  if (ratio <= 0.5) return 'positiveGreen.200';
  if (ratio <= 0.8) return 'warningOrange.200';
  return 'errorRed.200';
};
