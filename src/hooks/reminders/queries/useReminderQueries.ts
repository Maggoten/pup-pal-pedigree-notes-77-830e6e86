import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReminders } from '@/services/RemindersService';
import { Dog } from '@/types/dogs';
import { useSortedReminders } from '../useSortedReminders';
import { generateDogReminders } from '@/services/ReminderService';
import { formatISO } from 'date-fns';
import { isMobileSafari } from '@/integrations/supabase/client';

export const useReminderQueries = (userId: string | undefined, dogs: Dog[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Keep track of local state for mobile resilience
  const [hasInitializedReminders, setHasInitializedReminders] = useState(false);
  const [dogsPreviouslyProcessed, setDogsPreviouslyProcessed] = useState(false);
  
  // Use React Query for data fetching with resilient error handling
  const {
    data: paginatedData = { reminders: [], total: 0, currentPage: 1, totalPages: 1 },
    isLoading,
    isError,
    refetch,
    isFetching,
    error
  } = useQuery({
    queryKey: ['reminders', userId, currentPage, pageSize],
    queryFn: async () => {
      try {
        console.log(`[REMINDERS_QUERIES] Fetching reminders for user ${userId}, page ${currentPage}, size ${pageSize}`);
        
        if (!userId) {
          console.log('[REMINDERS_QUERIES] No user ID provided, returning empty reminders');
          return { reminders: [], total: 0, currentPage: 1, totalPages: 1 };
        }
        
        // Fetch reminders from the service
        const result = await fetchReminders(currentPage, pageSize);
        
        console.log(`[REMINDERS_QUERIES] Fetched ${result.reminders.length} reminders out of ${result.total} total`);
        
        // Log the first few reminders for debugging
        if (result.reminders.length > 0) {
          console.log('[REMINDERS_QUERIES] Sample reminders:', result.reminders.slice(0, 3).map(r => ({
            title: r.title,
            dueDate: r.dueDate instanceof Date ? formatISO(r.dueDate) : String(r.dueDate),
            type: r.type
          })));
        }
        
        return result;
      } catch (error) {
        console.error('[REMINDERS_QUERIES] Error fetching reminders:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { reminders, total, totalPages } = paginatedData;
  
  // Process dogs to generate reminders if needed (especially helpful for mobile devices)
  useEffect(() => {
    const shouldProcessDogs = 
      !hasInitializedReminders && 
      !isLoading && 
      !isFetching && 
      dogs.length > 0 && 
      (!reminders || reminders.length === 0) &&
      !dogsPreviouslyProcessed;

    if (shouldProcessDogs) {
      console.log('[REMINDERS_QUERIES] Processing dogs to generate reminders');
      try {
        const generatedReminders = generateDogReminders(dogs);
        console.log(`[REMINDERS_QUERIES] Generated ${generatedReminders.length} reminders from ${dogs.length} dogs`);
        
        // Log which types of reminders were generated
        const reminderTypes = generatedReminders.reduce((acc: Record<string, number>, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        }, {});
        console.log('[REMINDERS_QUERIES] Generated reminder types:', reminderTypes);
        
        setDogsPreviouslyProcessed(true);
      } catch (error) {
        console.error('[REMINDERS_QUERIES] Error generating reminders from dogs:', error);
      }
      
      setHasInitializedReminders(true);
    }
  }, [dogs, reminders, isLoading, isFetching, hasInitializedReminders, dogsPreviouslyProcessed]);
  
  // Enhanced logging for mobile debugging
  useEffect(() => {
    if (isMobileSafari()) {
      console.log('[REMINDERS_QUERIES] Mobile Safari detected, status:', {
        userId: userId || 'none',
        dogsCount: dogs.length,
        remindersCount: reminders?.length || 0,
        isLoading,
        isError,
        isFetching,
        currentPage,
        totalPages,
        hasInitializedReminders,
        dogsPreviouslyProcessed
      });
    }
  }, [userId, dogs.length, reminders, isLoading, isError, isFetching, currentPage, totalPages, hasInitializedReminders, dogsPreviouslyProcessed]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    reminders: useSortedReminders(reminders),
    total,
    currentPage,
    totalPages,
    pageSize,
    isLoading: isLoading || isFetching,
    hasError: isError,
    refetch,
    handlePageChange,
    handlePageSizeChange
  };
};
