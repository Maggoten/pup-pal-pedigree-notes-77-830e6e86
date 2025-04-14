
// This file now re-exports from the reminders directory to maintain backward compatibility
export {
  useBreedingReminders,
} from './reminders';

export type {
  Reminder,
  CustomReminderInput
} from './reminders';
