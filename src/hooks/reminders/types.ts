
import { Reminder } from '@/types/reminders';

export interface CustomReminderInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface UseRemindersReturn {
  reminders: Reminder[];
  loadingReminders: boolean;
  handleMarkComplete: (id: string) => Promise<void>;
  addCustomReminder: (input: CustomReminderInput) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}
