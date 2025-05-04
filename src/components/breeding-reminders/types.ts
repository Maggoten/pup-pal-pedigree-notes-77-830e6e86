
import { Reminder } from '@/types/reminders';

export interface RemindersData {
  reminders: Reminder[];
  isLoading: boolean;
  hasError: boolean;
  handleMarkComplete: (id: string) => void;
}

export interface BreedingRemindersProps {
  remindersData?: RemindersData;
}
