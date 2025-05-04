
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { useQueryClient } from '@tanstack/react-query';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { addReminder, deleteReminder, updateReminder } from '@/services/RemindersService';
import { formatISO } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useReminderQueries } from './queries/useReminderQueries';
import { DogReminderGenerator } from './generators/DogReminderGenerator';

// This hook provides reminders functionality throughout the app
export const useBreedingRemindersProvider = () => {
  const { user, supabaseUser } = useAuth();
  const { dogs, loading: dogsLoading } = useDogs();
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const userId = user?.id || supabaseUser?.id;
  
  // Get reminder data with React Query
  const { 
    reminders,
    total,
    currentPage,
    totalPages,
    pageSize,
    isLoading,
    hasError,
    refetch,
    handlePageChange,
    handlePageSizeChange
  } = useReminderQueries(userId, dogs);
  
  // Enhanced logging to debug missing reminders
  useEffect(() => {
    console.log('[BREEDING_REMINDERS] Provider state:', {
      userId: userId || 'none',
      dogsCount: dogs?.length || 0,
      dogsLoading,
      remindersCount: reminders?.length || 0,
      isLoading,
      hasError
    });

    // Log detailed dog data for debugging
    if (dogs && dogs.length > 0 && !reminders?.length) {
      console.log('[BREEDING_REMINDERS] Dogs available but no reminders. Checking dogs data:');
      dogs.forEach((dog, index) => {
        if (dog.gender === 'female') {
          console.log(`[BREEDING_REMINDERS] Female dog #${index}:`, {
            id: dog.id, 
            name: dog.name,
            hasHeatHistory: !!dog.heatHistory && Array.isArray(dog.heatHistory) && dog.heatHistory.length > 0,
            hasVaccinationDate: !!dog.vaccinationDate,
            heatHistorySample: dog.heatHistory && Array.isArray(dog.heatHistory) && dog.heatHistory.length > 0 ? 
              dog.heatHistory[0] : 'none'
          });
        }
      });

      // Attempt on-demand reminder generation
      if (!isLoading && userId && dogs.length > 0) {
        const dogReminderGenerator = new DogReminderGenerator(dogs);
        const generatedReminders = dogReminderGenerator.generateReminders();
        console.log(`[BREEDING_REMINDERS] Generated ${generatedReminders.length} reminders on demand`);
        
        if (generatedReminders.length > 0) {
          console.log('[BREEDING_REMINDERS] Sample generated reminder:', generatedReminders[0]);
        }
      }
    }
  }, [userId, dogs, reminders, isLoading, dogsLoading, hasError]);

  // Force an immediate refetch when dogs change or user becomes available
  useEffect(() => {
    if (userId && dogs.length > 0 && !dogsLoading) {
      console.log('[BREEDING_REMINDERS] Force refreshing reminder data - Dogs available');
      refetch();
    }
  }, [userId, dogs.length, dogsLoading, refetch]);
  
  // Add a handler for marking reminders as complete
  const handleMarkComplete = useCallback((id: string) => {
    if (!userId) {
      console.error('[BREEDING_REMINDERS] Cannot mark reminder complete: No user ID');
      return;
    }

    console.log(`[BREEDING_REMINDERS] Marking reminder ${id} as complete`);
    
    try {
      // Find the reminder to update
      const reminderToUpdate = reminders?.find(r => r.id === id);
      if (!reminderToUpdate) {
        console.error(`[BREEDING_REMINDERS] Reminder ${id} not found`);
        return;
      }
      
      // Update the reminder status - Fix: Pass just the boolean value for isCompleted
      updateReminder(id, true) // Changed from passing the whole reminder object to just passing true
        .then(() => {
          console.log(`[BREEDING_REMINDERS] Successfully marked reminder ${id} as complete`);
          refetch();
        })
        .catch(error => {
          console.error(`[BREEDING_REMINDERS] Error marking reminder as complete:`, error);
          toast({
            title: "Error",
            description: "Could not update the reminder status",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error('[BREEDING_REMINDERS] Error in handleMarkComplete:', error);
    }
  }, [userId, reminders, refetch]);

  // Add a custom reminder
  const addCustomReminder = useCallback(async (data: CustomReminderInput): Promise<boolean> => {
    if (!userId) {
      console.error('[BREEDING_REMINDERS] Cannot add reminder: No user ID');
      toast({
        title: "Error",
        description: "You must be logged in to add reminders",
        variant: "destructive"
      });
      return false;
    }

    try {
      const reminder: Omit<Reminder, 'id'> = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        type: 'custom',
        // Icon is added by the backend
        icon: null as any, // Will be set by the service
      };

      console.log('[BREEDING_REMINDERS] Adding custom reminder:', reminder);
      
      await addReminder(reminder);
      console.log('[BREEDING_REMINDERS] Custom reminder added successfully');
      
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
      
      toast({
        title: "Reminder Added",
        description: "Your reminder has been added successfully",
      });
      
      refetch();
      return true;
    } catch (error) {
      console.error('[BREEDING_REMINDERS] Error adding custom reminder:', error);
      toast({
        title: "Error",
        description: "Could not add the reminder",
        variant: "destructive"
      });
      return false;
    }
  }, [userId, queryClient, refetch]);

  // Delete a reminder
  const handleDeleteReminder = useCallback(async (id: string): Promise<void> => {
    if (!userId) {
      console.error('[BREEDING_REMINDERS] Cannot delete reminder: No user ID');
      return;
    }

    try {
      console.log(`[BREEDING_REMINDERS] Deleting reminder ${id}`);
      await deleteReminder(id);
      
      console.log(`[BREEDING_REMINDERS] Successfully deleted reminder ${id}`);
      
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error(`[BREEDING_REMINDERS] Error deleting reminder:`, error);
      toast({
        title: "Error",
        description: "Could not delete the reminder",
        variant: "destructive"
      });
    }
  }, [userId, queryClient, refetch]);

  // Force refetch function for manual refresh
  const refreshReminderData = useCallback(() => {
    console.log("[BREEDING_REMINDERS] Manually refreshing reminder data");
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
      refetch();
    } else {
      console.warn("[BREEDING_REMINDERS] Cannot refresh reminders: No user ID available");
    }
  }, [queryClient, userId, refetch]);

  return {
    reminders,
    isLoading: isLoading || dogsLoading,
    hasError,
    paginationData: {
      currentPage,
      totalPages,
      pageSize,
      total,
      handlePageChange,
      handlePageSizeChange
    },
    handleMarkComplete,
    addCustomReminder,
    deleteReminder: handleDeleteReminder,
    refreshReminderData
  };
};

// For backward compatibility
export const useBreedingReminders = useBreedingRemindersProvider;
