
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

/**
 * Converts a Date object to an ISO string without time information (YYYY-MM-DD)
 * This helps avoid timezone issues when storing dates
 */
export const dateToISOString = (date: Date): string => {
  if (!date) return '';
  
  try {
    // Extract year, month, and day components and format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return '';
  }
};

/**
 * Parses an ISO date string (YYYY-MM-DD) to a Date object
 * Sets the time to noon to avoid timezone-related date shifts
 */
export const parseISODate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    // Create a new date and set the time to noon to avoid timezone shifts
    const date = new Date(dateString);
    date.setHours(12, 0, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing ISO date string:', error);
    return null;
  }
};

/**
 * Formats a date as a string with the format YYYY-MM-DD
 */
export const formatDateYYYYMMDD = (date: Date): string => {
  if (!date) return '';
  
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date as YYYY-MM-DD:', error);
    return '';
  }
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Gets the current date at noon to avoid timezone issues
 */
export const getNoonDate = (): Date => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date;
};
