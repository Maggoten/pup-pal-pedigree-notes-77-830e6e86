
import { Reminder, CustomReminderInput } from '@/types/reminders';

export interface UseRemindersResult {
  reminders: Reminder[];
  isLoading: boolean;
  hasError: boolean;
  handleMarkComplete: (id: string, isCompleted?: boolean) => Promise<boolean>;
  addCustomReminder: (input: CustomReminderInput) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  refreshReminders: () => Promise<void>;
}
