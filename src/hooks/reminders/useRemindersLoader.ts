import { useCallback } from 'react';
import { useDogs } from '@/context/DogsContext';
import { useAuth } from '@/context/AuthContext';
import { generateDogReminders } from '@/services/reminders/DogReminderService';
import { generateLitterReminders } from '@/services/reminders/LitterReminderService';
import { generateGeneralReminders } from '@/services/reminders/GeneralReminderService';
import { litterService } from '@/services/LitterService';
import { fetchReminders, migrateRemindersFromLocalStorage } from '@/services/RemindersService';

export const useRemindersLoader = (
  hasMigrated: boolean,
  setHasMigrated: (value: boolean) => void,
  setReminders: (reminders: any[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setHasError: (hasError: boolean) => void,
  setCompletedReminderIds: (value: React.SetStateAction<Set<string>>) => void
) => {
  const { dogs } = useDogs();
  const { user } = useAuth();
  
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
  }, [dogs, user, hasMigrated, setHasMigrated, setReminders, setIsLoading, setHasError, setCompletedReminderIds]);
  
  return { loadReminders, user, dogs };
};
