import { format } from 'date-fns';
import { sv } from 'date-fns/locale/sv';
import { enUS } from 'date-fns/locale/en-US';

/**
 * Formats a date with the appropriate locale based on the current i18n language
 */
export const formatDateWithLocale = (date: Date, formatStr: string, language: string) => {
  const locale = language === 'sv' ? sv : enUS;
  return format(date, formatStr, { locale });
};