
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { useQueryClient } from '@tanstack/react-query';
import { useReminderQueries } from './queries/useReminderQueries';
import { useReminderMutations } from './mutations/useReminderMutations';
import { useSortedReminders } from './useSortedReminders';

// This is the centralized hook for reminders management across the application
export const useReminderProvider = () => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // Get reminder data with React Query
  const { 
    reminders,
    isLoading,
    hasError,
    refetch 
  } = useReminderQueries(user, dogs);
  
  // Get reminder mutations
  const {
    handleMarkComplete: markComplete,
    addCustomReminder,
    deleteReminder
  } = useReminderMutations(user);
  
  // Get sorted reminders - memoized in the hook
  const sortedReminders = useSortedReminders(reminders);
  
  // Force an immediate refetch on mount and when dogs change
  useEffect(() => {
    if (user) {
      console.log("[Reminders Provider] Force refreshing reminder data - User available with", dogs.length, "dogs");
      refetch();
    }
  }, [user, dogs.length, refetch]);
  
  // Force refetch function for manual refresh
  const refreshReminderData = useCallback(() => {
    console.log("[Reminders Provider] Manually refreshing reminder data");
    queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    refetch();
  }, [queryClient, user, refetch]);
  
  // Wrap handleMarkComplete to include reminders
  const handleMarkComplete = (id: string) => {
    markComplete(id, reminders);
  };
  
  return {
    reminders: sortedReminders,
    isLoading,
    hasError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder,
    refreshReminderData
  };
};
