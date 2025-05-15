
import { Reminder } from '@/types/reminders';

// Get custom reminders from localStorage
export const loadCustomReminders = (): Reminder[] => {
  try {
    const stored = localStorage.getItem('customReminders');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading custom reminders:', e);
    return [];
  }
};

// Get completed reminders from localStorage
export const loadCompletedReminders = (): Set<string> => {
  try {
    const stored = localStorage.getItem('completedReminders');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch (e) {
    console.error('Error loading completed reminders:', e);
    return new Set();
  }
};

// Get deleted reminders from localStorage
export const loadDeletedReminders = (): Set<string> => {
  try {
    const stored = localStorage.getItem('deletedReminderIds');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch (e) {
    console.error('Error loading deleted reminders:', e);
    return new Set();
  }
};
