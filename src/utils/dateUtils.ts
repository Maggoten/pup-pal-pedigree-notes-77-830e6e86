import { format, parse, isValid, parseISO } from 'date-fns';

/**
 * Format a date using date-fns format
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date as YYYY-MM-DD
 */
export const formatDateYYYYMMDD = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Determine if a date falls within a certain number of days from a base date
 */
export const isWithinDays = (date: Date, baseDate: Date, days: number): boolean => {
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + days);
  
  return date >= baseDate && date <= targetDate;
};

/**
 * Safely parse string to date
 */
export const parseDate = (dateString: string, formatString: string = 'yyyy-MM-dd'): Date | null => {
  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    return null;
  }
};

/**
 * Convert a Date object to ISO string format
 */
export const dateToISOString = (date: Date | null | undefined): string => {
  if (!date) return '';
  try {
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return '';
  }
};

/**
 * Parse an ISO string to a Date object
 */
export const parseISODate = (isoString: string | null | undefined): Date | null => {
  if (!isoString) return null;
  try {
    const date = parseISO(isoString);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
};

/**
 * Get noon time on a specific date
 */
export const getNoonDate = (date: Date): Date => {
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  return noon;
};
