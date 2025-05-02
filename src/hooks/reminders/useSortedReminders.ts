
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';

export const useSortedReminders = (reminders: Reminder[]) => {
  // Sort reminders by priority (high first) and then by completion status
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      // First sort by completion status
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      // Then sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [reminders]);

  return sortedReminders;
};
