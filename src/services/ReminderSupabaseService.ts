
// This file now re-exports from the reminders directory to maintain backward compatibility
import type { ReminderData, ReminderStatusData } from './reminders/types';

export type {
  // Types
  ReminderData,
  ReminderStatusData,
};

export {
  mapToReminder,
  createIconForReminder,
  
  // Data services
  fetchReminders,
  fetchReminderStatuses,
  
  // Status services
  updateReminderStatus,
  
  // Custom reminder services
  addCustomReminder,
  deleteReminder,
  
  // System reminder services
  addSystemReminder,
  
  // Migration services
  migrateLocalRemindersToSupabase
} from './reminders';
