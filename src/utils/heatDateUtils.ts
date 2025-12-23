import { dateToISOString, parseISODate } from '@/utils/dateUtils';

/**
 * Calculates which day in the cycle it is, where Day 1 = start date.
 * Handles timezones correctly by comparing local date parts only.
 * 
 * @param startDateString - The start date string (can be ISO format or YYYY-MM-DD)
 * @returns The day number in the cycle (1-indexed)
 */
export function getDayInCycle(startDateString: string): number {
  // Parse the start date using our timezone-safe utility
  const startDate = parseISODate(startDateString);
  
  // Get today's date using our timezone-safe utility
  const today = parseISODate(dateToISOString(new Date()));
  
  // Calculate difference in days
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Day 1 = start date, so add 1
  return diffDays + 1;
}
