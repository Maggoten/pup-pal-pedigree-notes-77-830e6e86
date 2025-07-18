import { useState, useEffect, useCallback, useMemo } from 'react';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { 
  fetchReminders, 
  migrateRemindersFromLocalStorage,
  addReminder,
  updateReminder,
  deleteReminder as deleteReminderFromSupabase,
  addSystemReminder,
  cleanupOldReminders
} from '@/services/RemindersService';
import { generateDogReminders } from '@/services/reminders/DogReminderService';
import { generateLitterReminders } from '@/services/reminders/LitterReminderService';
import { generateGeneralReminders } from '@/services/reminders/GeneralReminderService';
import { 
  generatePlannedHeatReminders, 
  generateEnhancedBirthdayReminders, 
  generateVaccinationReminders,
  mergeReminders 
} from '@/services/reminders/AutoRemindersService';
import { useSortedReminders } from './useSortedReminders';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plannedLittersService } from '@/services/PlannedLitterService';

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
  
  // Prevent multiple instances from running the same heavy operations
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  
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

  // Add a query to get planned litters for automatic reminders
  const { data: plannedLitters = [] } = useQuery({
    queryKey: ['planned-litters', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log(`[Reminders Debug] Fetching planned litters for reminders`);
      try {
        return await plannedLittersService.loadPlannedLitters();
      } catch (error) {
        console.error(`[Reminders Debug] Error loading planned litters:`, error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
  
  // Use React Query for data fetching with proper caching
  const { 
    data: reminders = [], 
    isLoading, 
    error: hasError 
  } = useQuery({
    queryKey: ['reminders', user?.id, dogs.length, plannedLitters.length],
    queryFn: async () => {
      if (!user) {
        console.log(`[Reminders Debug] No user available, skipping reminders fetch`);
        return [];
      }
      
      console.log(`[Reminders Debug] Fetching reminders for user: ${user.id} on ${deviceType}`);
      console.log(`[Reminders Debug] Available dogs for reminders: ${dogs.length}`);
      console.log(`[Reminders Debug] Available planned litters: ${plannedLitters.length}`);
      
      // Ensure migration happens before fetching
      await migrateRemindersIfNeeded();
      
      // Clean up old reminders periodically
      await cleanupOldReminders();
      
      // Fetch existing reminders from Supabase first
      console.log(`[Reminders Debug] Fetching existing reminders from Supabase`);
      const startTime = performance.now();
      const existingReminders = await fetchReminders();
      const endTime = performance.now();
      
      console.log(`[Reminders Debug] Fetch duration: ${Math.round(endTime - startTime)}ms`);
      console.log(`[Reminders Debug] Fetched ${existingReminders.length} existing reminders`);
      
      // Use only dogs belonging to current user - ENSURE USER FILTERING
      const userDogs = dogs.filter(dog => dog.owner_id === user.id);
      console.log(`[Reminders Debug] Found ${userDogs.length} dogs belonging to user ${user.id}`);
      
      // Log each dog for debugging
      userDogs.forEach(dog => {
        console.log(`[Reminders Debug] User dog: ${dog.name} (ID: ${dog.id}, Birthday: ${dog.dateOfBirth || 'none'}, Vaccination: ${dog.vaccinationDate || 'none'})`);
      });
      
      if (userDogs.length === 0 && plannedLitters.length === 0) {
        console.log(`[Reminders Debug] No user data available, showing only existing reminders`);
        return existingReminders;
      }
      
      try {
        // Generate all system reminders in sequence
        console.log(`[Reminders Debug] Generating dog reminders`);
        const dogReminders = generateDogReminders(userDogs);
        console.log(`[Reminders Debug] Generated ${dogReminders.length} dog reminders`);
        
        console.log(`[Reminders Debug] Generating litter reminders`);
        const litterReminders = await generateLitterReminders(user.id);
        console.log(`[Reminders Debug] Generated ${litterReminders.length} litter reminders`);
        
        console.log(`[Reminders Debug] Generating general reminders`);
        const generalReminders = generateGeneralReminders(userDogs);
        console.log(`[Reminders Debug] Generated ${generalReminders.length} general reminders`);
        
        // Generate the new automatic reminders
        console.log(`[Reminders Debug] Generating planned heat reminders`);
        const plannedHeatReminders = generatePlannedHeatReminders(plannedLitters);
        console.log(`[Reminders Debug] Generated ${plannedHeatReminders.length} planned heat reminders`);
        
        console.log(`[Reminders Debug] Generating enhanced birthday reminders`);
        const birthdayReminders = generateEnhancedBirthdayReminders(userDogs);
        console.log(`[Reminders Debug] Generated ${birthdayReminders.length} birthday reminders`);
        
        console.log(`[Reminders Debug] Generating vaccination reminders`);
        const vaccinationReminders = generateVaccinationReminders(userDogs);
        console.log(`[Reminders Debug] Generated ${vaccinationReminders.length} vaccination reminders`);
        
        // Collect all system-generated reminders
        const allSystemReminders = [
          ...dogReminders,
          ...litterReminders,
          ...generalReminders,
          ...plannedHeatReminders,
          ...birthdayReminders,
          ...vaccinationReminders
        ];
        
        console.log(`[Reminders Debug] Total system reminders generated: ${allSystemReminders.length}`);
        
        // Add system reminders to database that don't already exist
        console.log(`[Reminders Debug] Attempting to save system reminders to database`);
        
        // Add new system reminders to database in batches
        let savedCount = 0;
        for (const reminder of allSystemReminders) {
          try {
            const success = await addSystemReminder(reminder);
            if (success) {
              savedCount++;
              console.log(`[Reminders Debug] Successfully saved system reminder: ${reminder.title}`);
            } else {
              console.log(`[Reminders Debug] Skipped system reminder (already exists): ${reminder.title}`);
            }
          } catch (error) {
            console.error(`[Reminders Debug] Failed to save system reminder ${reminder.title}:`, error);
          }
        }
        
        console.log(`[Reminders Debug] Saved ${savedCount} new system reminders to database`);
        
        // Fetch updated reminders from database
        const finalReminders = await fetchReminders();
        
        console.log(`[Reminders Debug] Final result: ${finalReminders.length} reminders loaded from database`);
        
        return finalReminders;
      } catch (error) {
        console.error(`[Reminders Debug] Error generating reminders:`, error);
        // Return at least the existing reminders to prevent total failure
        return existingReminders;
      }
    },
    enabled: !!user && !isInitializing,
    staleTime: 1000 * 60 * (isMobileDevice() ? 1 : 5), // Consider data fresh for 1 min on mobile, 5 min on desktop
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error or constraint violation
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any;
        if (dbError.code === '23505' || dbError.code === '22P02') {
          return false;
        }
      }
      return failureCount < 2;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: isMobileDevice() ? true : false, // Refetch when regaining focus on mobile
  });
  
  // Get sorted reminders - memoized in the hook
  const sortedReminders = useSortedReminders(reminders);
  
  // Use mutations for state changes with optimistic updates
  const markCompleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`[Reminders Debug] Starting mutation for reminder ${id}`);
      
      // Find the current reminder to toggle its state
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) {
        console.error(`[Reminders Debug] Reminder with ID ${id} not found in current list`);
        throw new Error(`Reminder with ID ${id} not found`);
      }
      
      const newCompletedState = !reminder.isCompleted;
      console.log(`[Reminders Debug] Toggling reminder ${id} from ${reminder.isCompleted} to ${newCompletedState}`);
      
      // Update reminder in database
      const success = await updateReminder(id, newCompletedState);
      if (!success) {
        console.error(`[Reminders Debug] Failed to update reminder ${id} in database`);
        throw new Error('Failed to update reminder in database');
      }
      
      console.log(`[Reminders Debug] Successfully updated reminder ${id} in database`);
      return { id, newCompletedState };
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id, dogs.length, plannedLitters.length] });
      
      // Find the current reminder to toggle its state
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) {
        return { previousReminders: reminders };
      }
      
      const newCompletedState = !reminder.isCompleted;
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id, dogs.length, plannedLitters.length]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['reminders', user?.id, dogs.length, plannedLitters.length], (old: Reminder[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted: newCompletedState} : r)
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error("[Reminders Debug] Error marking reminder complete:", err);
      // Rollback to the previous state
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id, dogs.length, plannedLitters.length], context.previousReminders);
      }
      
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (result) => {
      console.log(`[Reminders Debug] Successfully marked reminder ${result.id} as ${result.newCompletedState ? 'completed' : 'not completed'}`);
      
      toast({
        title: result.newCompletedState ? "Reminder Completed" : "Reminder Reopened",
        description: result.newCompletedState 
          ? "This task has been marked as completed."
          : "This task has been marked as not completed."
      });
      
      // Force a refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id, dogs.length, plannedLitters.length] });
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
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id, dogs.length, plannedLitters.length] });
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
      // All reminders are now in the database, so we can delete all of them
      return await deleteReminderFromSupabase(id);
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id, dogs.length, plannedLitters.length] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id, dogs.length, plannedLitters.length]);
      
      // Optimistically update
      queryClient.setQueryData(['reminders', user?.id, dogs.length, plannedLitters.length], (old: Reminder[] = []) => 
        old.filter(r => r.id !== id)
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error("Error deleting reminder:", err);
      // Rollback on error
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id, dogs.length, plannedLitters.length], context.previousReminders);
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
    queryClient.invalidateQueries({ queryKey: ['reminders', user?.id, dogs.length, plannedLitters.length] });
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
