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
  
  // Use React Query for data fetching with proper caching - Fixed for v5 compatibility
  const { 
    data: reminders = [], 
    isLoading, 
    error: hasError,
    refetch 
  } = useQuery({
    queryKey: ['reminders', user?.id, dogs.length], // Added dogs.length to force refresh when dogs change
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
      console.log(`[Reminders Provider] Found ${userDogs.length} dogs belonging to user ${user.id}`);
      console.log("[Reminders Provider] Dog data:", userDogs.map(d => ({
        id: d.id, 
        name: d.name, 
        vaccDate: d.vaccinationDate,
        heatHistory: d.heatHistory?.length
      })));
      
      // Log each dog's vaccination date for debugging
      userDogs.forEach(dog => {
        console.log(`[Reminders Provider] Dog ${dog.name} (ID: ${dog.id}) - Vaccination date: ${dog.vaccinationDate || 'Not set'}`);
      });
      
      // Generate all reminders in sequence
      const dogReminders = userDogs.length > 0 ? generateDogReminders(userDogs) : [];
      console.log(`[Reminders Provider] Generated ${dogReminders.length} dog reminders`);
      
      // Log all vaccination reminders separately for debugging
      const vaccinationReminders = dogReminders.filter(r => r.type === 'vaccination');
      console.log(`[Reminders Provider] Generated ${vaccinationReminders.length} vaccination reminders`);
      vaccinationReminders.forEach(r => {
        console.log(`[Reminders Provider] Vaccination reminder: ${r.title}, Due: ${r.dueDate.toISOString()}`);
      });
      
      const litterReminders = await generateLitterReminders(user.id);
      console.log(`[Reminders Provider] Generated ${litterReminders.length} litter reminders`);
      
      const generalReminders = userDogs.length > 0 ? generateGeneralReminders(userDogs) : [];
      console.log(`[Reminders Provider] Generated ${generalReminders.length} general reminders`);
      
      // Return all reminders at once
      const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
      console.log(`[Reminders Provider] Total: ${allReminders.length} reminders loaded`);
      
      return allReminders;
    },
    enabled: !!user, // Changed to only check if user exists - don't block on dogs.length
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes (reduced from 5)
    retry: 1, // Only retry once to prevent excessive attempts
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Added to refresh when window regains focus
  });
  
  // Force an immediate refetch on mount to ensure fresh data
  useEffect(() => {
    if (user) {
      console.log("[Reminders Provider] Force refreshing reminder data on mount");
      refetch();
    }
  }, [user, refetch]);
  
  // Get sorted reminders - memoized in the hook
  const sortedReminders = useSortedReminders(reminders);
  
  // Use mutations for state changes with optimistic updates - Fixed for v5 compatibility
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
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['reminders', user?.id], (old: Reminder[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted} : r)
      );
      
      return { previousReminders };
    },
    onError: (err, { id }, context) => {
      console.error("Error marking reminder complete:", err);
      // Rollback to the previous state
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id], context.previousReminders);
      }
    },
    onSuccess: (result, { id, isCompleted }) => {
      console.log(`[Reminders Provider] Successfully marked reminder ${id} as ${isCompleted ? 'completed' : 'not completed'}`);
      
      // Keep the optimistic update in the query cache
      queryClient.setQueryData(['reminders', user?.id], (old: Reminder[] = []) => 
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
  
  // Fixed for v5 compatibility
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
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
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
  
  // Fixed for v5 compatibility
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
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id]);
      
      // Optimistically update
      queryClient.setQueryData(['reminders', user?.id], (old: Reminder[] = []) => 
        old.filter(r => r.id !== id)
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error("Error deleting reminder:", err);
      // Rollback on error
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id], context.previousReminders);
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
  const refreshReminderData = useCallback(() => {
    console.log("[Reminders Provider] Manually refreshing reminder data");
    queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    refetch();
  }, [queryClient, user, refetch]);
  
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
