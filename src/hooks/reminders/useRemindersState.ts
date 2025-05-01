
import { useState, useCallback } from 'react';
import { Reminder } from '@/types/reminders';
import { updateReminder, deleteReminder as apiDeleteReminder } from '@/services/RemindersService';

export const useRemindersState = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completedReminderIds, setCompletedReminderIds] = useState<Set<string>>(new Set());
  const [deletedReminderIds, setDeletedReminderIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  
  // Mark reminder as complete
  const handleMarkComplete = useCallback(async (id: string, isCompleted: boolean = true) => {
    try {
      // Update in local state immediately for a responsive UI
      if (isCompleted) {
        setCompletedReminderIds(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      } else {
        setCompletedReminderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      // Persist to Supabase
      const success = await updateReminder(id, isCompleted);
      return success;
    } catch (error) {
      console.error("Error updating reminder:", error);
      return false;
    }
  }, []);
  
  // Delete a reminder
  const handleDeleteReminder = useCallback(async (id: string) => {
    try {
      const success = await apiDeleteReminder(id);
      
      if (success) {
        // Update local state
        setReminders(prev => prev.filter(r => r.id !== id));
        
        // Also update tracking sets
        setCompletedReminderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      return false;
    }
  }, []);
  
  return {
    reminders,
    setReminders,
    completedReminderIds,
    setCompletedReminderIds,
    deletedReminderIds,
    setDeletedReminderIds,
    isLoading,
    setIsLoading,
    hasError,
    setHasError,
    hasMigrated,
    setHasMigrated,
    handleMarkComplete,
    handleDeleteReminder
  };
};
