import { useState, useEffect, useCallback } from 'react';
import { Reminder } from '@/types/reminders';
import { useDogs } from '@/context/DogsContext';
import { generateDogReminders } from '@/services/reminders/DogReminderService';
import { generateLitterReminders } from '@/services/reminders/LitterReminderService';
import { generateGeneralReminders } from '@/services/reminders/GeneralReminderService';
import { loadCustomReminders, loadCompletedReminders, loadDeletedReminders } from '@/utils/reminderStorage';
import { useAuth } from '@/context/AuthContext';
import { litterService } from '@/services/LitterService';
import { 
  fetchReminders, 
  updateReminder, 
  addReminder, 
  deleteReminder, 
  migrateRemindersFromLocalStorage 
} from '@/services/RemindersService';
import { CustomReminderInput } from '@/types/reminders';

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completedReminderIds, setCompletedReminderIds] = useState<Set<string>>(new Set());
  const [deletedReminderIds, setDeletedReminderIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  
  // Load reminders function
  const loadReminders = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Generate automatic reminders based on your dogs and litters
      const litters = litterService.loadLitters();
      
      // Combine all reminders from different sources
      const dogRems = generateDogReminders(dogs);
      const litterRems = generateLitterReminders();
      const generalRems = generateGeneralReminders(dogs);
      
      const generatedReminders = [
        ...dogRems,
        ...litterRems,
        ...generalRems
      ];
      
      // Set generated reminders initially to reduce loading flicker
      setReminders(prevReminders => {
        // Keep only custom reminders and add newly generated ones
        const customReminders = prevReminders.filter(r => r.type === 'custom');
        return [...generatedReminders, ...customReminders];
      });
      
      // Check if migration is needed (first time only)
      if (!hasMigrated) {
        try {
          await migrateRemindersFromLocalStorage();
          setHasMigrated(true);
        } catch (migrationErr) {
          console.error("Migration error (non-critical):", migrationErr);
        }
      }
      
      // Now fetch data from Supabase
      const fetchedReminders = await fetchReminders();
      
      // Update the reminders state with both generated and custom reminders
      setReminders([...generatedReminders, ...fetchedReminders]);
      
      // Update completion and deletion states
      const completedIds = new Set(
        fetchedReminders
          .filter(r => r.isCompleted)
          .map(r => r.id)
      );
      
      setCompletedReminderIds(completedIds);
    } catch (error) {
      console.error("Error loading reminders:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [dogs, user, hasMigrated]);
  
  // Load reminders on component mount and when dependencies change
  useEffect(() => {
    let isMounted = true;
    let loadingTimer: ReturnType<typeof setTimeout>;
    
    const loadWithDelay = async () => {
      // Only set loading state after a delay to avoid flickering for fast loads
      loadingTimer = setTimeout(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      }, 300);
      
      await loadReminders();
    };
    
    loadWithDelay();
    
    return () => {
      isMounted = false;
      clearTimeout(loadingTimer);
    };
  }, [dogs, user, hasMigrated, loadReminders]);
  
  // Mark reminder as complete
  const handleMarkComplete = useCallback(async (id: string, isCompleted: boolean) => {
    try {
      // Update in local state immediately for a responsive UI
      if (isCompleted) {
        setCompletedReminderIds(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      } else {
        setCompletedReminderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      // Persist to Supabase
      const success = await updateReminder(id, isCompleted);
      return success;
    } catch (error) {
      console.error("Error updating reminder:", error);
      return false;
    }
  }, []);
  
  // Add custom reminder
  const addCustomReminder = useCallback(async (input: CustomReminderInput) => {
    try {
      const success = await addReminder(input);
      
      if (success) {
        // Reload reminders to get the new one with its server-generated ID
        await loadReminders();
      }
      
      return success;
    } catch (error) {
      console.error("Error adding reminder:", error);
      return false;
    }
  }, [loadReminders]);
  
  // Delete a reminder
  const handleDeleteReminder = useCallback(async (id: string) => {
    try {
      const success = await deleteReminder(id);
      
      if (success) {
        // Update local state
        setReminders(prev => prev.filter(r => r.id !== id));
        
        // Also update tracking sets
        setCompletedReminderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      return false;
    }
  }, []);
  
  // Refresh reminders
  const refreshReminders = async () => {
    await loadReminders();
  };
  
  // Process reminders for display
  const processedReminders = reminders
    .filter(reminder => !deletedReminderIds.has(reminder.id))
    .map(reminder => ({
      ...reminder,
      isCompleted: completedReminderIds.has(reminder.id) || reminder.isCompleted
    }))
    .sort((a, b) => {
      // Sort by completion status first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      // Then sort by priority
      const priorityMap = { high: 1, medium: 2, low: 3 };
      const priorityA = priorityMap[a.priority as keyof typeof priorityMap];
      const priorityB = priorityMap[b.priority as keyof typeof priorityMap];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Finally sort by date
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
    
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
