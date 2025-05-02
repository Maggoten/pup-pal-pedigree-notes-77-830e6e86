
import { useRemindersLoader } from './useRemindersLoader';
import { useRemindersActions } from './useRemindersActions';
import { useSortedReminders } from './useSortedReminders';
import { Reminder, CustomReminderInput } from '@/types/reminders';

export type { Reminder, CustomReminderInput };

export const useBreedingReminders = () => {
  const { reminders, setReminders, isLoading, hasError } = useRemindersLoader();
  
  const { 
    handleMarkComplete, 
    addCustomReminder, 
    deleteReminder,
    refreshReminderData
  } = useRemindersActions(reminders, setReminders);
  
  // Get sorted reminders
  const sortedReminders = useSortedReminders(reminders);
  
  return {
    reminders: sortedReminders,
    isLoading,
    hasError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder,
    refreshReminderData
  };
};
