
// This file is kept for backward compatibility
// It re-exports the new modular hook structure
import { useBreedingRemindersProvider } from './reminders/useBreedingRemindersProvider';
import { Reminder, CustomReminderInput } from './reminders'; 

export { useBreedingRemindersProvider as useBreedingReminders };
export type { Reminder, CustomReminderInput };

// Re-export the hook with the same name for backward compatibility
const useBreedingReminders = useBreedingRemindersProvider;

export default useBreedingReminders;
