/**
 * Converts a Date object to YYYY-MM-DD string format
 * @param date - The date to convert
 * @returns ISO date string in YYYY-MM-DD format
 */
export const dateToISOString = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  // Use local timezone to get correct date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parses an ISO date string (YYYY-MM-DD) to a Date object
 * @param dateString - The ISO date string to parse
 * @returns Date object or current date if parsing fails
 */
export const parseISODate = (dateString: string): Date => {
  if (!dateString || typeof dateString !== 'string') {
    return new Date();
  }
  
  // For YYYY-MM-DD format, create date without timezone issues
  const dateParts = dateString.split('T')[0].split('-');
  if (dateParts.length !== 3) {
    return new Date();
  }
  
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(dateParts[2], 10);
  
  return new Date(year, month, day);
};

/**
 * Formats a date according to the specified locale
 * @param date - The date to format
 * @param locale - The locale to use for formatting (e.g., 'en-US', 'sv-SE')
 * @param options - Additional formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options for better readability
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  // Map i18n language codes to proper locales
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'sv': 'sv-SE',
  };

  const mappedLocale = localeMap[locale] || locale;

  try {
    return new Intl.DateTimeFormat(mappedLocale, defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to English if locale is not supported
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  }
};

/**
 * Formats a date for short display (e.g., "Jan 15, 2024" or "15 jan 2024")
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 * @returns Short formatted date string
 */
export const formatDateShort = (date: Date | string, locale: string = 'en-US'): string => {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date with time included
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string, locale: string = 'en-US'): string => {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};