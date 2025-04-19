export function formatLongDate(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getOrdinalNum = (number: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = number % 100;
  return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

export const formatFullDate = (input: string | Date): string => {
  const date =
    typeof input === 'string' ? new Date(input + 'T00:00:00') : input;

  const weekday = date.toLocaleDateString('en-CA', { weekday: 'long' });
  const month = date.toLocaleDateString('en-CA', { month: 'long' });
  const day = getOrdinalNum(date.getDate());

  return `${weekday}, ${month} ${day}`;
};
