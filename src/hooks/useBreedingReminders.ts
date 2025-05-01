
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
import { useAuth } from '@/context/AuthContext';

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
    let isMounted = true;
    let loadingTimer: ReturnType<typeof setTimeout>;
    
    const loadReminders = async () => {
      if (!user) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }
      
      // Only set loading after a delay to prevent flickering
      loadingTimer = setTimeout(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      }, 300);
      
      setHasError(false);
      
      try {
        // Generate system reminders first (these don't require database)
        const dogReminders = generateDogReminders(dogs);
        const litterReminders = generateLitterReminders();
        const generalReminders = generateGeneralReminders(dogs);
        
        // Set initial reminders immediately to prevent flickering
        if (isMounted) {
          setReminders([...dogReminders, ...litterReminders, ...generalReminders]);
        }
        
        // Check if migration is needed (first time only)
        if (!hasMigrated) {
          try {
            await migrateRemindersFromLocalStorage();
            if (isMounted) {
              setHasMigrated(true);
            }
          } catch (migrationErr) {
            console.error("Migration error (non-critical):", migrationErr);
          }
        }
        
        // Fetch custom reminders from Supabase
        try {
          const supabaseReminders = await fetchReminders();
          
          // Add custom reminders to the existing system reminders
          if (isMounted) {
            setReminders(prev => [...prev, ...supabaseReminders]);
          }
        } catch (fetchErr) {
          console.error("Error fetching custom reminders:", fetchErr);
          // Don't set error state here - we still have system reminders
        }
        
      } catch (error) {
        console.error("Error loading reminders:", error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        clearTimeout(loadingTimer);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadReminders();
    
    return () => {
      isMounted = false;
      clearTimeout(loadingTimer);
    };
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
      try {
        const success = await updateReminder(id, newStatus);
        
        if (!success) {
          // Revert the change if the API call fails
          setReminders(prev => prev.map(r => 
            r.id === id ? {...r, isCompleted: !newStatus} : r
          ));
          return;
        }
      } catch (error) {
        console.error("Error updating reminder:", error);
        // Revert the change if there's an error
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
    try {
      const success = await addReminder(input);
      
      if (!success) {
        // Revert the change if the API call fails
        setReminders(prev => prev.filter(r => r.id !== tempId));
        return;
      }
      
      // Fetch the updated reminders with the real ID
      try {
        const updatedReminders = await fetchReminders();
        
        const dogReminders = generateDogReminders(dogs);
        const litterReminders = generateLitterReminders();
        const generalReminders = generateGeneralReminders(dogs);
        
        // Combine all reminders
        setReminders([...updatedReminders, ...dogReminders, ...litterReminders, ...generalReminders]);
      } catch (fetchErr) {
        console.error("Error fetching updated reminders:", fetchErr);
      }
    } catch (error) {
      console.error("Error adding reminder:", error);
      // Revert the change if there's an error
      setReminders(prev => prev.filter(r => r.id !== tempId));
    }
  };
  
  const deleteReminderHandler = async (id: string) => {
    // Optimistically update UI
    setReminders(prev => prev.filter(r => r.id !== id));
    
    // If it's a UUID format (custom reminder in DB), call the delete API
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      try {
        const success = await deleteReminderFromSupabase(id);
        
        if (!success) {
          // Fetch fresh data on error to restore state
          try {
            const updatedReminders = await fetchReminders();
            
            const dogReminders = generateDogReminders(dogs);
            const litterReminders = generateLitterReminders();
            const generalReminders = generateGeneralReminders(dogs);
            
            setReminders([...updatedReminders, ...dogReminders, ...litterReminders, ...generalReminders]);
          } catch (fetchErr) {
            console.error("Error fetching reminders after deletion failure:", fetchErr);
          }
          return;
        }
      } catch (error) {
        console.error("Error deleting reminder:", error);
        // Restore state if there's an error
        const dogReminders = generateDogReminders(dogs);
        const litterReminders = generateLitterReminders();
        const generalReminders = generateGeneralReminders(dogs);
        
        try {
          const updatedReminders = await fetchReminders();
          setReminders([...updatedReminders, ...dogReminders, ...litterReminders, ...generalReminders]);
        } catch (fetchErr) {
          console.error("Error fetching reminders after deletion error:", fetchErr);
          setReminders([...dogReminders, ...litterReminders, ...generalReminders]);
        }
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
