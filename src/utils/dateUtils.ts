/**
 * Utilities for handling dates in a timezone-safe manner
 */

/**
 * Converts a Date object to a YYYY-MM-DD string without timezone influence
 * This ensures the date shown to the user is the date they selected
 */
export const dateToISOString = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  
  // Extract the year, month, and day components using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format as YYYY-MM-DD
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string to a Date object at 12:00 noon to avoid timezone issues
 * Using noon prevents the date from shifting due to timezone conversions
 */
export const parseISODate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  
  // Create a date at noon in the user's local timezone
  // This helps avoid date shifts due to timezone conversions
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  
  const date = new Date();
  date.setFullYear(year);
  date.setMonth(month - 1); // months are 0-indexed
  date.setDate(day);
  
  // Set to noon to avoid timezone-related date shifts
  date.setHours(12, 0, 0, 0);
  
  return date;
};

/**
 * Formats a database date string for display
 * Takes either a full ISO string or a YYYY-MM-DD string and returns a clean display format
 */
export const formatDateForDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  
  // Handle both full ISO strings and YYYY-MM-DD strings
  const date = parseISODate(dateStr.includes('T') ? dateStr.split('T')[0] : dateStr);
  if (!date) return '';
  
  // Use toLocaleDateString for a user-friendly format
  return date.toLocaleDateString();
};

/**
 * Safely prepares a date for storage in the database
 * Converts any date input to a YYYY-MM-DD string without time components
 */
export const prepareDateForStorage = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    // If it's already a string, ensure it's in YYYY-MM-DD format
    return date.includes('T') ? date.split('T')[0] : date;
  }
  
  // Otherwise, convert the Date object to YYYY-MM-DD
  return dateToISOString(date);
};
