
import { useEffect, useCallback } from 'react';
import { useRemindersState } from './useRemindersState';
import { useRemindersLoader } from './useRemindersLoader';
import { useRemindersProcessor } from './useRemindersProcessor';
import { useCustomReminderActions } from './useCustomReminderActions';
import { UseRemindersResult } from './types';

export const useBreedingReminders = (): UseRemindersResult => {
  const {
    reminders,
    setReminders,
    completedReminderIds,
    setCompletedReminderIds,
    deletedReminderIds,
    isLoading,
    setIsLoading,
    hasError,
    setHasError,
    hasMigrated,
    setHasMigrated,
    handleMarkComplete,
    handleDeleteReminder
  } = useRemindersState();
  
  const { loadReminders, user } = useRemindersLoader(
    hasMigrated,
    setHasMigrated,
    setReminders,
    setIsLoading,
    setHasError,
    setCompletedReminderIds
  );
  
  const processedReminders = useRemindersProcessor(
    reminders,
    completedReminderIds,
    deletedReminderIds
  );
  
  const { addCustomReminder } = useCustomReminderActions(loadReminders);
  
  // Load reminders on component mount and when dependencies change
  useEffect(() => {
    let isMounted = true;
    let loadingTimer: ReturnType<typeof setTimeout>;
    
    const loadWithDelay = async () => {
      // Only set loading state after a delay to avoid flickering for fast loads
      loadingTimer = setTimeout(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      }, 300);
      
      await loadReminders();
    };
    
    loadWithDelay();
    
    return () => {
      isMounted = false;
      clearTimeout(loadingTimer);
    };
  }, [user, hasMigrated, loadReminders, setIsLoading]);
  
  // Refresh reminders
  const refreshReminders = useCallback(async () => {
    await loadReminders();
  }, [loadReminders]);
  
  return {
    reminders: processedReminders,
    isLoading,
    hasError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder: handleDeleteReminder,
    refreshReminders
  };
};
