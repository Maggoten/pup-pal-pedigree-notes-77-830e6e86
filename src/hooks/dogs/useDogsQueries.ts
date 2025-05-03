
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import { fetchDogs } from '@/services/dogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseDogsQueries } from './types';
import { useAuth } from '@/hooks/useAuth';
import { TIMEOUT } from '@/utils/timeoutUtils';

export const useDogsQueries = (): UseDogsQueries => {
  const { user } = useAuth();
  const userId = user?.id;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add logging to track userId
  useEffect(() => {
    console.log('useDogsQueries: userId value changed:', userId);
  }, [userId]);
  
  // Using React Query for better caching and performance
  const {
    data: dogs = [],
    isLoading,
    error,
    refetch,
    status,
    fetchStatus
  } = useQuery({
    queryKey: ['dogs', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('useDogsQueries: No userId provided, returning empty dogs array');
        return [];
      }
      try {
        console.log('Fetching dogs from service for user:', userId);
        const data = await fetchDogs(userId);
        console.log(`Retrieved ${data.length} dogs for user ${userId}`);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching dogs:', errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        throw err;
      } finally {
        setIsInitialLoad(false);
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: 3, // Increase retry attempts for mobile networks
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max 30s
  });

  // Add detailed logging about query status
  useEffect(() => {
    console.log('Dogs query status:', status, 'fetchStatus:', fetchStatus, 'isLoading:', isLoading);
    console.log('Query is enabled:', !!userId);
  }, [status, fetchStatus, isLoading, userId]);

  // Rename function to avoid conflict with the imported service
  const refreshDogs = useCallback(async (skipCache = false) => {
    console.log('refreshDogs called with skipCache:', skipCache);
    if (skipCache) {
      console.log('Invalidating dogs query cache');
      // Use direct invalidation instead of removing the query
      await queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
    }
    console.log('Refetching dogs data');
    const result = await refetch();
    console.log('Refetch result:', result.status, 'data length:', result.data?.length || 0);
    return result.data || [];
  }, [refetch, queryClient, userId]);

  // Updated timeout to match TIMEOUT from timeoutUtils for consistency
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (userId && isInitialLoad) {
      console.log('Initial load - fetching dogs');
      refetch();
      
      // Set a timeout to stop the initial loading state after TIMEOUT milliseconds
      timeoutId = setTimeout(() => {
        if (isInitialLoad) {
          console.log('Initial load timeout reached, resetting loading state');
          setIsInitialLoad(false);
          
          // If no data was loaded, show an error toast with retry option
          if (dogs.length === 0 && !error) {
            toast({
              title: "Loading timeout",
              description: "Could not load dogs in a reasonable time. Pull down to refresh.",
              variant: "destructive"
            });
          }
        }
      }, TIMEOUT); // Use the same TIMEOUT value from utils for consistency
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, refetch, isInitialLoad, dogs.length, error, toast]);

  return {
    dogs,
    isLoading: isLoading || isInitialLoad,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    fetchDogs: refreshDogs, // Return the renamed function
    useDogs: () => ({ data: dogs, isLoading: isLoading || isInitialLoad, error }) // Add useDogs method
  };
};
