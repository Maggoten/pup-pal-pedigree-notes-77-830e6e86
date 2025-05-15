
import { Reminder } from '@/types/reminders';

// Load custom reminders from localStorage
export const loadCustomReminders = (): Reminder[] => {
  const storedCustomReminders = localStorage.getItem('customReminders');
  if (storedCustomReminders) {
    return JSON.parse(storedCustomReminders).map((r: any) => ({
      ...r,
      dueDate: new Date(r.dueDate),
      // Note: icon will be regenerated in the main hook
    }));
  }
  return [];
};

// Save custom reminders to localStorage
export const saveCustomReminders = (reminders: Reminder[]): void => {
  if (reminders.length > 0) {
    const serializableReminders = reminders.map(r => ({
      ...r,
      icon: null // Don't store React nodes in localStorage
    }));
    localStorage.setItem('customReminders', JSON.stringify(serializableReminders));
  }
};

// Load completed reminders from localStorage
export const loadCompletedReminders = (): Set<string> => {
  const storedCompletedReminders = localStorage.getItem('completedReminders');
  if (storedCompletedReminders) {
    return new Set(JSON.parse(storedCompletedReminders));
  }
  return new Set();
};

// Save completed reminders to localStorage
export const saveCompletedReminders = (completedIds: Set<string>): void => {
  if (completedIds.size > 0) {
    localStorage.setItem('completedReminders', JSON.stringify([...completedIds]));
  }
};

// Load deleted reminders from localStorage
export const loadDeletedReminders = (): Set<string> => {
  const storedDeletedReminders = localStorage.getItem('deletedReminderIds');
  if (storedDeletedReminders) {
    return new Set(JSON.parse(storedDeletedReminders));
  }
  return new Set();
};

// Save deleted reminders to localStorage
export const saveDeletedReminders = (deletedIds: Set<string>): void => {
  if (deletedIds.size > 0) {
    localStorage.setItem('deletedReminderIds', JSON.stringify([...deletedIds]));
  }
};
