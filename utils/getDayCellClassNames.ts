export const getDayCellClassNames = (
  date: Date,
  selectedDate: Date | null
): string => {
  const day = date.getDay();
  let classes = day === 0 || day === 6 ? 'fc-weekend' : '';

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    classes += ' fc-today';
  }

  if (
    selectedDate &&
    date.toDateString() === selectedDate.toDateString() &&
    !isToday
  ) {
    classes += ' fc-selected-date';
  }

  return classes;
};
