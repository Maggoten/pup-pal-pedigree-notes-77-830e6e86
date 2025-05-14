
/**
 * Formats a date according to the specified options
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Checks if a date is within a specified number of days from the reference date
 */
export const isWithinDays = (date: Date, referenceDate: Date, days: number): boolean => {
  const diffTime = Math.abs(referenceDate.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};
