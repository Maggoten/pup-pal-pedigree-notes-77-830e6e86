
import { useState, useEffect } from 'react';
import { Reminder } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { 
  fetchReminders, 
  migrateRemindersFromLocalStorage 
} from '@/services/RemindersService';
import { 
  generateDogReminders, 
  generateLitterReminders, 
  generateGeneralReminders 
} from '@/services/ReminderService';

export const useRemindersLoader = () => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  
  // Fetch reminders when component mounts or when dogs/user changes
  useEffect(() => {
    const loadReminders = async () => {
      if (!user) {
        // Don't fetch if not authenticated
        console.log("useRemindersLoader: No authenticated user, skipping reminder fetch");
        setIsLoading(false);
        return;
      }
      
      console.log("useRemindersLoader: Loading reminders for user:", user.id);
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
        console.log(`useRemindersLoader: Fetched ${supabaseReminders.length} reminders from Supabase`);
        
        // Make sure we only generate reminders for the current user's dogs
        // dogs from the DogsContext should already be filtered by owner_id
        console.log(`useRemindersLoader: Generating dog reminders from ${dogs.length} dogs`);
        console.log("Dogs data for reminders:", dogs);
        
        // Filter dogs to ensure we only have current user's dogs
        const userDogs = dogs.filter(dog => dog.owner_id === user.id);
        console.log(`useRemindersLoader: Filtered to ${userDogs.length} dogs belonging to current user`);
        
        const dogReminders = generateDogReminders(userDogs);
        console.log(`useRemindersLoader: Generated ${dogReminders.length} dog reminders`);
        
        // Get litter reminders for the current user - this returns a Promise
        const litterRemindersPromise = generateLitterReminders(user.id);
        // Wait for the promise to resolve
        const litterReminders = await litterRemindersPromise;
        console.log(`useRemindersLoader: Generated ${litterReminders.length} litter reminders`);
        
        // Generate general reminders only for the user's dogs
        const generalReminders = generateGeneralReminders(userDogs);
        console.log(`useRemindersLoader: Generated ${generalReminders.length} general reminders`);
        
        // Combine all reminders
        const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
        
        console.log('useRemindersLoader: Total reminders loaded:', allReminders.length);
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
  
  return {
    reminders,
    setReminders,
    isLoading,
    hasError
  };
};
