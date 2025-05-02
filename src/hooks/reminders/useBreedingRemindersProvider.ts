
import { useState, useEffect, useCallback } from 'react';
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

// This is the centralized hook for reminders management across the application
export const useBreedingRemindersProvider = () => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);
  
  // Get sorted reminders - memoized in the hook
  const sortedReminders = useSortedReminders(reminders);
  
  // Consolidated fetch function with debouncing protection
  const fetchReminderData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple rapid fetch requests (debounce)
    const now = Date.now();
    if (now - lastFetchTimestamp < 2000) {
      console.log("Debounced rapid reminder fetch request");
      return;
    }
    
    setLastFetchTimestamp(now);
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log("[Reminders Provider] Fetching reminders for user:", user.id);
      
      // Only migrate once per session
      if (!hasMigrated) {
        await migrateRemindersFromLocalStorage();
        setHasMigrated(true);
      }
      
      // Fetch custom reminders from Supabase
      const supabaseReminders = await fetchReminders();
      console.log(`[Reminders Provider] Fetched ${supabaseReminders.length} custom reminders`);
      
      // Use only dogs belonging to current user
      const userDogs = dogs.filter(dog => dog.owner_id === user.id);
      
      // Generate all reminders in sequence
      const dogReminders = generateDogReminders(userDogs);
      const litterReminders = await generateLitterReminders(user.id);
      const generalReminders = generateGeneralReminders(userDogs);
      
      // Set all reminders at once to prevent multiple renders
      const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
      console.log(`[Reminders Provider] Total: ${allReminders.length} reminders loaded`);
      
      setReminders(allReminders);
    } catch (error) {
      console.error("[Reminders Provider] Error loading reminders:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user, dogs, hasMigrated, lastFetchTimestamp]);
  
  // Initial fetch & refetch on dependencies change
  useEffect(() => {
    fetchReminderData();
  }, [fetchReminderData]);
  
  // Action handlers with optimistic updates
  const handleMarkComplete = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    const newStatus = !reminder.isCompleted;
    
    // Optimistic update
    setReminders(prev => prev.map(r => 
      r.id === id ? {...r, isCompleted: newStatus} : r
    ));
    
    // Update in Supabase for custom reminders
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const success = await updateReminder(id, newStatus);
      
      if (!success) {
        // Revert on failure
        setReminders(prev => prev.map(r => 
          r.id === id ? {...r, isCompleted: !newStatus} : r
        ));
        return;
      }
    }
    
    toast({
      title: newStatus ? "Reminder Completed" : "Reminder Reopened",
      description: newStatus 
        ? "This task has been marked as completed."
        : "This task has been marked as not completed."
    });
  };
  
  const addCustomReminder = async (input: CustomReminderInput) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add reminders.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await addReminder(input);
      
      if (success) {
        // Refetch data to get the new reminder with proper ID
        await fetchReminderData();
        
        toast({
          title: "Success",
          description: "Reminder added successfully."
        });
      }
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const deleteReminder = async (id: string) => {
    // Optimistic update
    setReminders(prev => prev.filter(r => r.id !== id));
    
    // If UUID format, delete from database
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const success = await deleteReminderFromSupabase(id);
      
      if (!success) {
        // Refetch on error to restore state
        await fetchReminderData();
        return;
      }
    }
    
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been deleted successfully."
    });
  };
  
  return {
    reminders: sortedReminders,
    isLoading,
    hasError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder,
    refreshReminderData: fetchReminderData
  };
};
