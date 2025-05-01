
import { useEffect, useCallback, useRef } from 'react';
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
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  
  // Load reminders on component mount and when dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadWithDelay = async () => {
      // Clear any existing timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      // Only set loading state after a delay to avoid flickering for fast loads
      loadingTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(true);
        }
      }, 300);
      
      await loadReminders();
      
      // Clear the loading timer if reminders loaded quickly
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
    
    loadWithDelay();
    
    return () => {
      isMountedRef.current = false;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
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
