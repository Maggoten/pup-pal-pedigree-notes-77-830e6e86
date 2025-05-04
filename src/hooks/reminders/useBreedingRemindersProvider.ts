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
import { generateDogReminders } from '@/services/reminders/DogReminderService';
import { generateLitterReminders } from '@/services/reminders/LitterReminderService';
import { generateGeneralReminders } from '@/services/reminders/GeneralReminderService';
import { useSortedReminders } from './useSortedReminders';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Add device detection
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// This is the centralized hook for reminders management across the application
export const useBreedingRemindersProvider = () => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  
  console.log(`[Reminders Debug] Hook initialized on ${deviceType}, user ID: ${user?.id || 'none'}, dogs count: ${dogs.length}`);
  
  // Handle migration first (happens once per session)
  const migrateRemindersIfNeeded = useCallback(async () => {
    if (!hasMigrated && user) {
      console.log("[Reminders Debug] Starting data migration check...");
      await migrateRemindersFromLocalStorage();
      setHasMigrated(true);
      console.log("[Reminders Debug] Migration completed.");
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
      if (!user) {
        console.log(`[Reminders Debug] No user available, skipping reminders fetch`);
        return [];
      }
      
      console.log(`[Reminders Debug] Fetching reminders for user: ${user.id} on ${deviceType}`);
      console.log(`[Reminders Debug] Available dogs for reminders: ${dogs.length}`);
      
      // Ensure migration happens before fetching
      await migrateRemindersIfNeeded();
      
      // Fetch custom reminders from Supabase
      console.log(`[Reminders Debug] Fetching custom reminders from Supabase`);
      const startTime = performance.now();
      const supabaseReminders = await fetchReminders();
      const endTime = performance.now();
      
      console.log(`[Reminders Debug] Fetch duration: ${Math.round(endTime - startTime)}ms`);
      console.log(`[Reminders Debug] Fetched ${supabaseReminders.length} custom reminders`);
      
      // Use only dogs belonging to current user
      const userDogs = dogs.filter(dog => dog.owner_id === user.id);
      console.log(`[Reminders Debug] Found ${userDogs.length} dogs belonging to user ${user.id}`);
      
      if (userDogs.length === 0) {
        console.log(`[Reminders Debug] No user dogs available, showing only custom reminders`);
        return supabaseReminders;
      }
      
      try {
        // Generate all reminders in sequence
        console.log(`[Reminders Debug] Generating dog reminders`);
        const dogReminders = generateDogReminders(userDogs);
        console.log(`[Reminders Debug] Generated ${dogReminders.length} dog reminders`);
        
        console.log(`[Reminders Debug] Generating litter reminders`);
        const litterReminders = await generateLitterReminders(user.id);
        console.log(`[Reminders Debug] Generated ${litterReminders.length} litter reminders`);
        
        console.log(`[Reminders Debug] Generating general reminders`);
        const generalReminders = generateGeneralReminders(userDogs);
        console.log(`[Reminders Debug] Generated ${generalReminders.length} general reminders`);
        
        // Return all reminders at once
        const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
        console.log(`[Reminders Debug] Total: ${allReminders.length} reminders loaded`);
        
        return allReminders;
      } catch (error) {
        console.error(`[Reminders Debug] Error generating reminders:`, error);
        // Return at least the custom reminders to prevent total failure
        return supabaseReminders;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * (isMobileDevice() ? 1 : 5), // Consider data fresh for 1 min on mobile, 5 min on desktop
    retry: 2, // Retry twice to handle mobile connection issues
    refetchOnMount: true,
    refetchOnWindowFocus: isMobileDevice() ? true : false, // Refetch when regaining focus on mobile
  });
  
  // Get sorted reminders - memoized in the hook
  const sortedReminders = useSortedReminders(reminders);
  
  // Use mutations for state changes with optimistic updates
  const markCompleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`[Reminders Debug] Marking reminder ${id} as completed`);
      
      // Find the current reminder to toggle its state
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) {
        console.error(`[Reminders Debug] Reminder with ID ${id} not found`);
        return false;
      }
      
      const newCompletedState = !reminder.isCompleted;
      
      // Only update custom reminders in database (those with UUIDs)
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        return await updateReminder(id, newCompletedState);
      }
      // For system-generated reminders, we still return success but don't persist to DB
      return true;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id, dogs.length] });
      
      // Find the current reminder to toggle its state
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) {
        return { previousReminders: reminders };
      }
      
      const newCompletedState = !reminder.isCompleted;
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id, dogs.length]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['reminders', user?.id, dogs.length], (old: Reminder[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted: newCompletedState} : r)
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error("[Reminders Debug] Error marking reminder complete:", err);
      // Rollback to the previous state
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id, dogs.length], context.previousReminders);
      }
    },
    onSuccess: (result, id) => {
      // Find the current reminder to get its new state for the message
      const reminder = reminders.find(r => r.id === id);
      const newCompletedState = reminder ? !reminder.isCompleted : true;
      
      console.log(`[Reminders Debug] Successfully marked reminder ${id} as ${newCompletedState ? 'completed' : 'not completed'}`);
      
      toast({
        title: newCompletedState ? "Reminder Completed" : "Reminder Reopened",
        description: newCompletedState 
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
    markCompleteReminderMutation.mutate(id);
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
