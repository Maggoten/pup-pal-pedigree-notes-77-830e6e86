
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';

export interface RemindersSummary {
  count: number;
  highPriority: number;
}

export const useRemindersSummary = (reminders: Reminder[]): RemindersSummary => {
  const remindersSummary = useMemo(() => {
    const highPriorityCount = reminders.filter(r => r.priority === 'high' && !r.isCompleted).length;
    return {
      count: reminders.filter(r => !r.isCompleted).length,
      highPriority: highPriorityCount
    };
  }, [reminders]);

  return remindersSummary;
};
