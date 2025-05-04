
// This file re-exports reminders operations to maintain backward compatibility
import {
  fetchReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  migrateRemindersFromLocalStorage
} from '@/services/reminders/operations';

// Re-export all operations
export {
  fetchReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  migrateRemindersFromLocalStorage
};
