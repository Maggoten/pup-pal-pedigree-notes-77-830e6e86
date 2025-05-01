
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
  const isLoadingRef = useRef(false); // To prevent multiple simultaneous loads
  
  // Load reminders on component mount and when dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadWithDelay = async () => {
      // Prevent duplicate loads
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      
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
      
      try {
        await loadReminders();
      } catch (error) {
        console.error("Error loading reminders:", error);
      } finally {
        // Clear the loading timer if reminders loaded
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
        
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        
        isLoadingRef.current = false;
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
    if (isLoadingRef.current) return; // Prevent duplicate loads
    
    isLoadingRef.current = true;
    try {
      await loadReminders();
    } catch (error) {
      console.error("Error refreshing reminders:", error);
    } finally {
      isLoadingRef.current = false;
    }
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
