
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';

export const useRemindersProcessor = (
  reminders: Reminder[],
  completedReminderIds: Set<string>,
  deletedReminderIds: Set<string>
) => {
  // Process reminders for display
  const processedReminders = useMemo(() => {
    return reminders
      .filter(reminder => !deletedReminderIds.has(reminder.id))
      .map(reminder => ({
        ...reminder,
        isCompleted: completedReminderIds.has(reminder.id) || reminder.isCompleted
      }))
      .sort((a, b) => {
        // Sort by completion status first
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        
        // Then sort by priority
        const priorityMap = { high: 1, medium: 2, low: 3 };
        const priorityA = priorityMap[a.priority as keyof typeof priorityMap];
        const priorityB = priorityMap[b.priority as keyof typeof priorityMap];
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Finally sort by date
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
  }, [reminders, completedReminderIds, deletedReminderIds]);
  
  return processedReminders;
};
