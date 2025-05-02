
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { 
  generateDogReminders,
  generateLitterReminders,
  generateGeneralReminders
} from '@/services/ReminderService';
import { 
  fetchReminders, 
  addReminder, 
  updateReminder, 
  deleteReminder as deleteReminderFromSupabase,
  migrateRemindersFromLocalStorage 
} from '@/services/RemindersService';
import { useAuth } from '@/hooks/useAuth';

export type { Reminder, CustomReminderInput };

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  
  // Fetch reminders when component mounts or when dogs/user changes
  useEffect(() => {
    const loadReminders = async () => {
      if (!user) {
        // Don't fetch if not authenticated
        console.log("useBreedingReminders: No authenticated user, skipping reminder fetch");
        setIsLoading(false);
        return;
      }
      
      console.log("useBreedingReminders: Loading reminders for user:", user.id);
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Check if migration is needed (first time only)
        if (!hasMigrated) {
          await migrateRemindersFromLocalStorage();
          setHasMigrated(true);
        }
        
        // Fetch reminders from Supabase - these are already filtered by user ID through RLS
        const supabaseReminders = await fetchReminders();
        console.log(`useBreedingReminders: Fetched ${supabaseReminders.length} reminders from Supabase`);
        
        // Make sure we only generate reminders for the current user's dogs
        // dogs from the DogsContext should already be filtered by owner_id
        console.log(`useBreedingReminders: Generating dog reminders from ${dogs.length} dogs`);
        console.log("Dogs data for reminders:", dogs);
        
        // Filter dogs to ensure we only have current user's dogs
        const userDogs = dogs.filter(dog => dog.owner_id === user.id);
        console.log(`useBreedingReminders: Filtered to ${userDogs.length} dogs belonging to current user`);
        
        const dogReminders = generateDogReminders(userDogs);
        console.log(`useBreedingReminders: Generated ${dogReminders.length} dog reminders`);
        
        // Get litter reminders for the current user - this now returns a Promise
        const litterRemindersPromise = generateLitterReminders(user.id);
        // Wait for the promise to resolve
        const litterReminders = await litterRemindersPromise;
        console.log(`useBreedingReminders: Generated ${litterReminders.length} litter reminders`);
        
        // Generate general reminders only for the user's dogs
        const generalReminders = generateGeneralReminders(userDogs);
        console.log(`useBreedingReminders: Generated ${generalReminders.length} general reminders`);
        
        // Combine all reminders
        const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
        
        console.log('useBreedingReminders: Total reminders loaded:', allReminders.length);
        setReminders(allReminders);
      } catch (error) {
        console.error("Error loading reminders:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReminders();
  }, [dogs, user, hasMigrated]);
  
  // Sort reminders by priority (high first) and then by completion status
  const sortedReminders = [...reminders].sort((a, b) => {
    // First sort by completion status
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    
    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const handleMarkComplete = async (id: string) => {
    // Find the reminder in our list
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    const newStatus = !reminder.isCompleted;
    
    // Optimistically update the UI
    setReminders(prev => prev.map(r => 
      r.id === id ? {...r, isCompleted: newStatus} : r
    ));
    
    // Update in Supabase if it's a custom reminder (uuid format)
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const success = await updateReminder(id, newStatus);
      
      if (!success) {
        // Revert the change if the API call fails
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
    
    // Create a temporary reminder for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newReminder: Reminder = {
      id: tempId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      type: 'custom',
      icon: createCalendarClockIcon(
        input.priority === 'high' ? 'rose-500' : 
        input.priority === 'medium' ? 'amber-500' : 'green-500'
      )
    };
    
    // Optimistically update UI
    setReminders(prev => [...prev, newReminder]);
    
    // Add to Supabase
    const success = await addReminder(input);
    
    if (!success) {
      // Revert the change if the API call fails
      setReminders(prev => prev.filter(r => r.id !== tempId));
    } else {
      // Refresh the data from the server to get the real ID
      const updatedReminders = await fetchReminders();
      
      const dogReminders = generateDogReminders(dogs);
      // Fix: Get litter reminders and wait for the Promise to resolve
      const litterRemindersPromise = generateLitterReminders(user.id);
      const litterReminders = await litterRemindersPromise;
      const generalReminders = generateGeneralReminders(dogs);
      
      // Combine all reminders
      setReminders([...updatedReminders, ...dogReminders, ...litterReminders, ...generalReminders]);
    }
  };
  
  const deleteReminderHandler = async (id: string) => {
    // Optimistically update UI
    setReminders(prev => prev.filter(r => r.id !== id));
    
    // If it's a UUID format (custom reminder in DB), call the delete API
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const success = await deleteReminderFromSupabase(id);
      
      if (!success) {
        // Fetch fresh data on error to restore state
        const updatedReminders = await fetchReminders();
        
        const dogReminders = generateDogReminders(dogs);
        // Fix: Get litter reminders and wait for the Promise to resolve
        const litterRemindersPromise = generateLitterReminders(user.id);
        const litterReminders = await litterRemindersPromise;
        const generalReminders = generateGeneralReminders(dogs);
        
        setReminders([...updatedReminders, ...dogReminders, ...litterReminders, ...generalReminders]);
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
    deleteReminder: deleteReminderHandler
  };
};
