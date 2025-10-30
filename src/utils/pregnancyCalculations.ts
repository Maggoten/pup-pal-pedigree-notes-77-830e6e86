import { differenceInDays, addDays, startOfDay } from 'date-fns';

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
