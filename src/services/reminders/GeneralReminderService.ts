
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { differenceInMonths, parseISO, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import i18n from '@/i18n';

// Helper method to get translation with fallback
const t = (key: string, options?: any): string => {
  return i18n.t(key, { ...options, ns: 'dogs' }) as string;
};

// Generate deterministic UUID for system reminders
const generateSystemReminderId = (dogId: string, type: string): string => {
  return uuidv4();
};

/**
 * Generate general breeding-related reminders
 */
export const generateGeneralReminders = (dogs: Dog[]): Reminder[] => {
  // Heat tracking reminders have been removed to prevent daily bombardment
  // for young female dogs. Heat cycle reminders based on history are still
  // generated in DogReminderService.ts
  return [];
};
