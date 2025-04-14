
import { useRemindersData } from './useRemindersData';
import { useReminderActions } from './useReminderActions';
import type { CustomReminderInput } from './types';
import type { Reminder } from '@/types/reminders';

export type { CustomReminderInput };
export type { Reminder };

export const useBreedingReminders = () => {
  const {
    reminders,
    loadingReminders,
    setReminders,
    loadRemindersData
  } = useRemindersData();

  const {
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  } = useReminderActions(reminders, setReminders, loadRemindersData);

  return {
    reminders,
    loadingReminders,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  };
};
