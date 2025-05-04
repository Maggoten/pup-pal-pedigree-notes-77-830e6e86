
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';

export interface RemindersSummary {
  count: number;
  highPriority: number;
}

export const useRemindersSummary = (reminders: Reminder[] = []): RemindersSummary => {
  const remindersSummary = useMemo(() => {
    // Handle null or undefined reminders
    if (!reminders || !Array.isArray(reminders)) {
      console.warn("useRemindersSummary received invalid reminders:", reminders);
      return {
        count: 0,
        highPriority: 0
      };
    }
    
    const nonCompletedReminders = reminders.filter(r => !r.isCompleted);
    const highPriorityCount = nonCompletedReminders.filter(r => r.priority === 'high').length;
    
    return {
      count: nonCompletedReminders.length,
      highPriority: highPriorityCount
    };
  }, [reminders]);

  return remindersSummary;
};
