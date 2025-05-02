
import { useBreedingRemindersProvider } from './useBreedingRemindersProvider';
import { useSortedReminders } from './useSortedReminders';
import { Reminder, CustomReminderInput } from '@/types/reminders';

export type { Reminder, CustomReminderInput };

export const useBreedingReminders = useBreedingRemindersProvider;
export { useSortedReminders };
