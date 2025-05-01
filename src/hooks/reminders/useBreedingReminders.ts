
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
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const initialLoadCompletedRef = useRef(false);
  
  // Load reminders only once on mount or when user changes
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only load if user exists and we haven't loaded yet
    const shouldLoadReminders = user && !initialLoadCompletedRef.current;
    
    if (shouldLoadReminders && !isLoadingRef.current) {
      console.log('useBreedingReminders: Initial load of reminders');
      isLoadingRef.current = true;
      
      loadReminders()
        .then(() => {
          if (isMountedRef.current) {
            initialLoadCompletedRef.current = true;
            lastLoadTimeRef.current = Date.now();
          }
        })
        .catch(error => {
          console.error('Error loading reminders:', error);
        })
        .finally(() => {
          if (isMountedRef.current) {
            setIsLoading(false);
            isLoadingRef.current = false;
          }
        });
    }
    
    return () => {
      isMountedRef.current = false;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [user, loadReminders, setIsLoading]);
  
  // Heavily debounced refresh function
  const refreshReminders = useCallback(async () => {
    // Prevent excessive refreshes
    if (isLoadingRef.current) return;
    
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Heavy debounce - 30 seconds between refreshes
    if (timeSinceLastLoad < 30000 && lastLoadTimeRef.current !== 0) {
      console.log('useBreedingReminders: Skipping refresh due to debounce');
      return;
    }
    
    console.log('useBreedingReminders: Refreshing reminders');
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      await loadReminders();
      lastLoadTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error refreshing reminders:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [loadReminders, setIsLoading]);
  
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
