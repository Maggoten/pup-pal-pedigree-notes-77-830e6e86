
// This file now re-exports from the reminders directory to maintain backward compatibility
export {
  // Types
  ReminderData,
  ReminderStatusData,
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
