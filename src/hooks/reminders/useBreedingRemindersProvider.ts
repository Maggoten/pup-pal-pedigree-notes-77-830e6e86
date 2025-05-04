import { useState, useEffect, useCallback, useMemo } from 'react';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { 
  fetchReminders, 
  migrateRemindersFromLocalStorage,
  addReminder,
  updateReminder,
  deleteReminder as deleteReminderFromSupabase
} from '@/services/RemindersService';
import { 
  generateDogReminders, 
  generateLitterReminders, 
  generateGeneralReminders 
} from '@/services/ReminderService';
import { useSortedReminders } from './useSortedReminders';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// This is the centralized hook for reminders management across the application
export const useBreedingRemindersProvider = () => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // Handle migration first (happens once per session)
  const migrateRemindersIfNeeded = useCallback(async () => {
    if (!hasMigrated && user) {
      console.log("[Reminders Provider] Starting data migration check...");
      await migrateRemindersFromLocalStorage();
      setHasMigrated(true);
      console.log("[Reminders Provider] Migration completed.");
    }
  }, [hasMigrated, user]);
  
  // Use React Query for data fetching with proper caching
  const { 
    data: reminders = [], 
    isLoading, 
    error: hasError 
  } = useQuery({
    queryKey: ['reminders', user?.id, dogs.length],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("[Reminders Provider] Fetching reminders for user:", user.id);
      
      // Ensure migration happens before fetching
      await migrateRemindersIfNeeded();
      
      // Fetch custom reminders from Supabase
      const supabaseReminders = await fetchReminders();
      console.log(`[Reminders Provider] Fetched ${supabaseReminders.length} custom reminders`);
      
      // Use only dogs belonging to current user
      const userDogs = dogs.filter(dog => dog.owner_id === user.id);
      console.log(`[Reminders Provider] Found ${userDogs.length} dogs belonging to user`);
      
      // Generate all reminders in sequence
      const dogReminders = generateDogReminders(userDogs);
      console.log(`[Reminders Provider] Generated ${dogReminders.length} dog reminders`);
      
      const litterReminders = await generateLitterReminders(user.id);
      console.log(`[Reminders Provider] Generated ${litterReminders.length} litter reminders`);
      
      const generalReminders = generateGeneralReminders(userDogs);
      console.log(`[Reminders Provider] Generated ${generalReminders.length} general reminders`);
      
      // Return all reminders at once
      const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
      console.log(`[Reminders Provider] Total: ${allReminders.length} reminders loaded`);
      
      return allReminders;
    },
    enabled: !!user && dogs.length > 0,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 1, // Only retry once to prevent excessive attempts
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Prevent refetching when window regains focus
  });
  
  // Get sorted reminders - memoized in the hook
  const sortedReminders = useSortedReminders(reminders);
  
  // Use mutations for state changes with optimistic updates
  const markCompleteReminderMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string, isCompleted: boolean }) => {
      console.log(`[Reminders Provider] Marking reminder ${id} as ${isCompleted ? 'completed' : 'not completed'}`);
      
      // Only update custom reminders in database (those with UUIDs)
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        return await updateReminder(id, isCompleted);
      }
      // For system-generated reminders, we still return success but don't persist to DB
      return true;
    },
    onMutate: async ({ id, isCompleted }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id, dogs.length] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id, dogs.length]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['reminders', user?.id, dogs.length], (old: Reminder[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted} : r)
      );
      
      return { previousReminders };
    },
    onError: (err, { id }, context) => {
      console.error("Error marking reminder complete:", err);
      // Rollback to the previous state
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id, dogs.length], context.previousReminders);
      }
    },
    onSuccess: (result, { id, isCompleted }) => {
      console.log(`[Reminders Provider] Successfully marked reminder ${id} as ${isCompleted ? 'completed' : 'not completed'}`);
      
      // Keep the optimistic update in the query cache
      queryClient.setQueryData(['reminders', user?.id, dogs.length], (old: Reminder[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted} : r)
      );
      
      toast({
        title: isCompleted ? "Reminder Completed" : "Reminder Reopened",
        description: isCompleted 
          ? "This task has been marked as completed."
          : "This task has been marked as not completed."
      });
    }
  });
  
  const addCustomReminderMutation = useMutation({
    mutationFn: async (input: CustomReminderInput) => {
      if (!user) throw new Error("User authentication required");
      return await addReminder(input);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder added successfully."
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id, dogs.length] });
    },
    onError: (error) => {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      // Only delete from database if it's a custom reminder (has UUID format)
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        return await deleteReminderFromSupabase(id);
      }
      return true;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id, dogs.length] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id, dogs.length]);
      
      // Optimistically update
      queryClient.setQueryData(['reminders', user?.id, dogs.length], (old: Reminder[] = []) => 
        old.filter(r => r.id !== id)
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error("Error deleting reminder:", err);
      // Rollback on error
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id, dogs.length], context.previousReminders);
      }
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been deleted successfully."
      });
    }
  });
  
  // Action handler wrappers
  const handleMarkComplete = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    markCompleteReminderMutation.mutate({ 
      id, 
      isCompleted: !reminder.isCompleted 
    });
  };
  
  const addCustomReminder = async (input: CustomReminderInput) => {
    try {
      await addCustomReminderMutation.mutateAsync(input);
      return true;
    } catch {
      return false;
    }
  };
  
  const deleteReminder = async (id: string) => {
    try {
      await deleteReminderMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };
  
  // Force refetch function for manual refresh
  const refreshReminderData = () => {
    queryClient.invalidateQueries({ queryKey: ['reminders', user?.id, dogs.length] });
  };
  
  return {
    reminders: sortedReminders,
    isLoading,
    hasError: !!hasError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder,
    refreshReminderData
  };
};
