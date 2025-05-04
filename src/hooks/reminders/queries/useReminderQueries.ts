
import { useQuery } from '@tanstack/react-query';
import { fetchReminders, migrateRemindersFromLocalStorage } from '@/services/RemindersService';
import { generateDogReminders } from '@/services/reminders/DogReminderService';
import { generateLitterReminders } from '@/services/reminders/LitterReminderService';
import { generateGeneralReminders } from '@/services/reminders/GeneralReminderService';
import { useCallback } from 'react';
import { Reminder } from '@/types/reminders';

export const useReminderQueries = (user: any, dogs: any[]) => {
  // Handle migration (happens once per session)
  const migrateRemindersIfNeeded = useCallback(async (hasMigrated: boolean) => {
    if (!hasMigrated && user) {
      console.log("[Reminders Provider] Starting data migration check...");
      await migrateRemindersFromLocalStorage();
      console.log("[Reminders Provider] Migration completed.");
      return true;
    }
    return hasMigrated;
  }, [user]);
  
  // Use React Query for data fetching with proper caching
  const { 
    data: reminders = [], 
    isLoading, 
    error: hasError,
    refetch 
  } = useQuery({
    queryKey: ['reminders', user?.id, dogs.length], 
    queryFn: async () => {
      if (!user) {
        console.log("[Reminders Provider] No user found, returning empty reminders array");
        return [];
      }
      
      console.log("[Reminders Provider] Fetching reminders for user:", user.id);
      
      // Ensure migration happens before fetching
      await migrateRemindersIfNeeded(false);
      
      // Fetch custom reminders from Supabase
      const supabaseReminders = await fetchReminders();
      console.log(`[Reminders Provider] Fetched ${supabaseReminders.length} custom reminders`);
      
      // Use only dogs belonging to current user
      const userDogs = dogs.filter(dog => dog.owner_id === user.id);
      console.log(`[Reminders Provider] Found ${userDogs.length} dogs belonging to user ${user.id}`);
      
      // Detailed dog data for debugging
      userDogs.forEach(dog => {
        console.log(`[Reminders Provider] Dog ${dog.name} (ID: ${dog.id}):
          - Vaccination date: ${dog.vaccinationDate || 'Not set'}
          - Gender: ${dog.gender || 'Not set'}
          - Heat history: ${dog.heatHistory?.length || 0} entries
          - DOB: ${dog.dateOfBirth || 'Not set'}`
        );
      });
      
      try {
        // Generate all reminders in sequence
        const dogReminders = userDogs.length > 0 ? generateDogReminders(userDogs) : [];
        console.log(`[Reminders Provider] Generated ${dogReminders.length} dog reminders:`);
        dogReminders.forEach(r => console.log(`  - ${r.title} (${r.type}) - Due: ${r.dueDate.toISOString().slice(0, 10)} - Priority: ${r.priority}`));
        
        const litterReminders = await generateLitterReminders(user.id);
        console.log(`[Reminders Provider] Generated ${litterReminders.length} litter reminders`);
        
        const generalReminders = userDogs.length > 0 ? generateGeneralReminders(userDogs) : [];
        console.log(`[Reminders Provider] Generated ${generalReminders.length} general reminders`);
        
        // Return all reminders at once
        const allReminders = [...supabaseReminders, ...dogReminders, ...litterReminders, ...generalReminders];
        console.log(`[Reminders Provider] Total: ${allReminders.length} reminders loaded`);
        
        return allReminders;
      } catch (error) {
        console.error("[Reminders Provider] Error generating reminders:", error);
        // Return whatever reminders we have so far, even if there was an error
        return supabaseReminders;
      }
    },
    enabled: !!user, // Enable when user is available, even if dogs are not yet loaded
    staleTime: 1000 * 60, // Consider data fresh for just 1 minute (reduced from 2)
    retry: 2, // Increased retry attempts to handle transient issues
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Added to refresh when window regains focus
  });
  
  return {
    reminders,
    isLoading,
    hasError: !!hasError,
    refetch
  };
};
