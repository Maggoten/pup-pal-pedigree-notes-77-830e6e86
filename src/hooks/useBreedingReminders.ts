
// This file is kept for backward compatibility
// It re-exports the new modular hook structure
import { useBreedingReminders as useBreedingRemindersHook, Reminder, CustomReminderInput } from './reminders';
export { useBreedingReminders };
export type { Reminder, CustomReminderInput };

// Re-export the hook with the same name
const useBreedingReminders = useBreedingRemindersHook;
