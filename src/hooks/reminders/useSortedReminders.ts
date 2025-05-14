
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';

// Sorting options for reminders
type SortOption = 'date-asc' | 'date-desc' | 'priority' | 'status';

export const useSortedReminders = (
  reminders: Reminder[],
  sortBy: SortOption = 'date-asc',
  filterCompleted: boolean = false
) => {
  return useMemo(() => {
    if (!reminders || reminders.length === 0) {
      return [];
    }

    // First apply filter if needed
    let filtered = reminders;
    if (filterCompleted) {
      filtered = reminders.filter(reminder => !reminder.isCompleted);
    }

    // Then apply sorting
    return [...filtered].sort((a, b) => {
      // Convert dates for comparison
      const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
      
      switch (sortBy) {
        case 'date-asc':
          return dateA.getTime() - dateB.getTime();
        
        case 'date-desc':
          return dateB.getTime() - dateA.getTime();
        
        case 'priority': {
          // Priority order: high (0), medium (1), low (2)
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          
          // If same priority, sort by date ascending
          if (priorityDiff === 0) {
            return dateA.getTime() - dateB.getTime();
          }
          return priorityDiff;
        }
        
        case 'status': {
          // Completed items go to the bottom
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
          
          // If both have same completion status, sort by date
          return dateA.getTime() - dateB.getTime();
        }
        
        default:
          return 0;
      }
    });
  }, [reminders, sortBy, filterCompleted]);
};
