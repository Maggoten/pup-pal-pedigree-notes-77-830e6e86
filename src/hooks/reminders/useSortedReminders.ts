
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';
import { isBefore, isToday } from 'date-fns';

export const useSortedReminders = (reminders: Reminder[]) => {
  // Sort reminders by priority (high first), completion status, and due date
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      // First sort by completion status
      const aCompleted = a.is_completed || a.isCompleted || false;
      const bCompleted = b.is_completed || b.isCompleted || false;
      
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      // For non-completed reminders, sort by priority first
      if (!aCompleted && !bCompleted) {
        // Then sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by date (past/today dates first, then future dates)
        const aIsToday = isToday(a.dueDate);
        const bIsToday = isToday(b.dueDate);
        const aIsPast = isBefore(a.dueDate, new Date()) && !aIsToday;
        const bIsPast = isBefore(b.dueDate, new Date()) && !bIsToday;
        
        // Past dates first
        if (aIsPast && !bIsPast) return -1;
        if (!aIsPast && bIsPast) return 1;
        
        // Then today's dates
        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;
        
        // Then sort by date
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      // For completed reminders, sort by most recently completed (assuming dueDate is completion date)
      if (aCompleted && bCompleted) {
        return b.dueDate.getTime() - a.dueDate.getTime(); 
      }
      
      // The above clauses should cover all cases, this is just a fallback
      return 0;
    });
  }, [reminders]);

  return sortedReminders;
};
