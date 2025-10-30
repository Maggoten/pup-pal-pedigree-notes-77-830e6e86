import { differenceInDays, addDays, startOfDay } from 'date-fns';

// Re-export addDays for convenience
export { addDays };

/**
 * Normalize date to UTC midnight for consistent comparison
 */
export const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return startOfDay(d);
};

/**
 * Calculate days since mating (D+X)
 */
export const calculateDaysPregnant = (matingDate: Date): number => {
  const today = normalizeDate(new Date());
  const mating = normalizeDate(matingDate);
  const diff = differenceInDays(today, mating);
  return Math.max(0, Math.min(63, diff));
};

/**
 * Calculate progress percentage for entire pregnancy period
 */
export const calculateProgress = (matingDate: Date, currentDate?: Date): number => {
  const current = currentDate ? normalizeDate(currentDate) : normalizeDate(new Date());
  const mating = normalizeDate(matingDate);
  const days = differenceInDays(current, mating);
  return Math.max(0, Math.min(100, (days / 63) * 100));
};

/**
 * Format day label (D+X)
 */
export const formatDayLabel = (matingDate: Date): string => {
  const days = calculateDaysPregnant(matingDate);
  return `D+${days}`;
};

/**
 * Calculate due date (63 days after mating)
 */
export const calculateDueDate = (matingDate: Date): Date => {
  return addDays(normalizeDate(matingDate), 63);
};

/**
 * Check if date is within ±2 days from due date
 */
export const isWithinDueDateUncertainty = (date: Date, dueDate: Date): boolean => {
  const normalized = normalizeDate(date);
  const due = normalizeDate(dueDate);
  const diff = Math.abs(differenceInDays(normalized, due));
  return diff >= 1 && diff <= 2;
};

/**
 * Check if a date is in the due week (D61-D65)
 */
export const isInDueWeek = (date: Date, matingDate: Date): boolean => {
  const current = normalizeDate(date);
  const mating = normalizeDate(matingDate);
  const dueDate = calculateDueDate(mating);
  const startDueWeek = addDays(dueDate, -2); // D61
  const endDueWeek = addDays(dueDate, 2);     // D65
  
  return current >= startDueWeek && current <= endDueWeek;
};

/**
 * Check if a pregnancy is active during a specific week
 */
export const isPregnancyActiveInWeek = (
  pregnancy: { startDate: Date | string; endDate?: Date | string },
  weekStart: Date,
  weekEnd: Date
): boolean => {
  const matingDate = normalizeDate(pregnancy.startDate);
  const dueDate = pregnancy.endDate 
    ? normalizeDate(pregnancy.endDate)
    : addDays(matingDate, 63);
  
  const normalizedWeekStart = normalizeDate(weekStart);
  const normalizedWeekEnd = normalizeDate(weekEnd);
  
  // Check if pregnancy period overlaps with this week
  return !(dueDate < normalizedWeekStart || matingDate > normalizedWeekEnd);
};

/**
 * Check if any day in the week is in due week for any pregnancy
 */
export const isInDueWeekForAnyPregnancy = (
  date: Date,
  pregnancies: Array<{ startDate: Date | string }>
): boolean => {
  return pregnancies.some(p => isInDueWeek(date, normalizeDate(p.startDate)));
};
