
import { useQuery } from '@tanstack/react-query';
import { fetchReminders, migrateRemindersFromLocalStorage } from '@/services/RemindersService';
import { generateDogReminders } from '@/services/reminders/DogReminderService';
import { generateLitterReminders } from '@/services/reminders/LitterReminderService';
import { generateGeneralReminders } from '@/services/reminders/GeneralReminderService';
import { useCallback, useState } from 'react';
import { Reminder } from '@/types/reminders';

export const useReminderQueries = (user: any, dogs: any[]) => {
  // Add pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
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
    data: remindersData = { reminders: [], total: 0, currentPage: 1, totalPages: 1 }, 
    isLoading, 
    error: hasError,
    refetch 
  } = useQuery({
    queryKey: ['reminders', user?.id, page, pageSize, dogs.length], 
    queryFn: async () => {
      if (!user) {
        console.log("[Reminders Provider] No user found, returning empty reminders array");
        return { reminders: [], total: 0, currentPage: 1, totalPages: 1 };
      }
      
      console.log(`[Reminders Provider] Fetching reminders for user: ${user.id}, page: ${page}, pageSize: ${pageSize}`);
      
      // Ensure migration happens before fetching
      await migrateRemindersIfNeeded(false);
      
      // Fetch custom reminders from Supabase with pagination
      const paginatedReminders = await fetchReminders(page, pageSize);
      console.log(`[Reminders Provider] Fetched ${paginatedReminders.reminders.length} custom reminders (page ${page}/${paginatedReminders.totalPages})`);
      
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
        
        // Combine all reminders
        const allGeneratedReminders = [...dogReminders, ...litterReminders, ...generalReminders];
        
        // For the paginated view, we need to merge generated reminders with db reminders
        // But we need to be careful with pagination - this is a bit complex because
        // we need to consider both sources
        
        // Return paginated reminders along with all generated system reminders
        // This isn't perfect pagination, but it's a pragmatic approach since we can't easily paginate
        // across two different data sources (DB + generated reminders)
        return {
          reminders: [...paginatedReminders.reminders, ...allGeneratedReminders],
          total: paginatedReminders.total + allGeneratedReminders.length,
          currentPage: paginatedReminders.currentPage,
          totalPages: paginatedReminders.totalPages,
          generatedRemindersCount: allGeneratedReminders.length
        };
      } catch (error) {
        console.error("[Reminders Provider] Error generating reminders:", error);
        // Return whatever reminders we have so far, even if there was an error
        return {
          reminders: paginatedReminders.reminders,
          total: paginatedReminders.total,
          currentPage: paginatedReminders.currentPage,
          totalPages: paginatedReminders.totalPages,
          generatedRemindersCount: 0
        };
      }
    },
    enabled: !!user, // Enable when user is available, even if dogs are not yet loaded
    staleTime: 1000 * 60, // Consider data fresh for just 1 minute (reduced from 2)
    retry: 2, // Increased retry attempts to handle transient issues
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Added to refresh when window regains focus
  });
  
  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    console.log(`[Reminders Provider] Changing to page ${newPage}`);
    setPage(newPage);
  }, []);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    console.log(`[Reminders Provider] Changing page size to ${newPageSize}`);
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);
  
  return {
    reminders: remindersData.reminders || [],
    total: remindersData.total || 0,
    currentPage: remindersData.currentPage || 1,
    totalPages: remindersData.totalPages || 1,
    isLoading,
    hasError: !!hasError,
    refetch,
    handlePageChange,
    handlePageSizeChange,
    pageSize
  };
};
