
// This file is kept for backward compatibility
// It re-exports the new modular hook structure
import { useBreedingRemindersProvider } from './reminders/useBreedingRemindersProvider';
export { useBreedingRemindersProvider as useBreedingReminders };
export type { Reminder, CustomReminderInput } from '@/types/reminders';

// Re-export the hook with the same name for backward compatibility
const useBreedingReminders = useBreedingRemindersProvider;
export default useBreedingReminders;
