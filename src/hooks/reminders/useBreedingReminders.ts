
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
  
  // Load reminders only once on mount or when user changes
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadWithDebounce = async () => {
      if (isLoadingRef.current || !user) return;
      
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTimeRef.current;
      
      // Substantial debounce to prevent excessive loads
      if (timeSinceLastLoad < 10000 && lastLoadTimeRef.current !== 0) {
        return;
      }
      
      isLoadingRef.current = true;
      
      // Clear any existing timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      try {
        await loadReminders();
        lastLoadTimeRef.current = Date.now();
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        
        isLoadingRef.current = false;
      }
    };
    
    loadWithDebounce();
    
    return () => {
      isMountedRef.current = false;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [user]);
  
  // Refresh reminders with heavy debounce
  const refreshReminders = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Heavy debounce to prevent excessive loads
    if (timeSinceLastLoad < 10000 && lastLoadTimeRef.current !== 0) {
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      await loadReminders();
      lastLoadTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error refreshing reminders:", error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
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
