
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import { fetchDogs } from '@/services/dogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseDogsQueries } from './types';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithRetry } from '@/utils/fetchUtils';

export const useDogsQueries = (): UseDogsQueries => {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
        throw err;
      } finally {
        setIsInitialLoad(false);
      }
    },
    enabled: !!userId && !authLoading, // Only run query when userId is available AND auth is done loading
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: 2, // Retry failed queries twice
    retryDelay: attempt => Math.min(1000 * Math.pow(2, attempt), 30000), // Exponential backoff
  });

  // Add detailed logging about query status
  useEffect(() => {
    console.log('Dogs query status:', status, 'fetchStatus:', fetchStatus, 'isLoading:', isLoading);
    console.log('Auth loading:', authLoading, 'Query is enabled:', !!userId && !authLoading);
  }, [status, fetchStatus, isLoading, userId, authLoading]);

  // Improved refresh function with optional skipCache parameter and retry logic
  const refreshDogs = useCallback(async (skipCache = false) => {
    console.log('refreshDogs called with skipCache:', skipCache);
    
    if (skipCache) {
      console.log('Invalidating dogs query cache');
      await queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
    }
    
    try {
      console.log('Refetching dogs data');
      
      // Use fetchWithRetry for more reliable data fetching
      const result = await fetchWithRetry(
        () => refetch(), 
        {
          maxRetries: 2,
          initialDelay: 2000,
          onRetry: (attempt) => {
            toast({
              title: `Retry ${attempt}/2`,
              description: "Retrying to fetch dog data..."
            });
          }
        }
      );
      
      console.log('Refetch result:', result.status, 'data length:', result.data?.length || 0);
      return result.data || [];
    } catch (error) {
      console.error('Failed to refresh dogs after retries:', error);
      toast({
        title: "Failed to refresh",
        description: "Could not load dog data after multiple attempts. Please try again later.",
        variant: "destructive",
        action: {
          label: "Retry",
          onClick: () => refreshDogs(true),
          className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
        }
      });
      return [];
    }
  }, [refetch, queryClient, userId, toast]);

  // Add a timeout for the initial load to prevent infinite loading
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (userId && isInitialLoad && !authLoading) {
      console.log('Initial load - fetching dogs');
      refetch();
      
      // Set a timeout to stop the initial loading state after 10 seconds
      timeoutId = setTimeout(() => {
        if (isInitialLoad) {
          console.log('Initial load timeout reached, resetting loading state');
          setIsInitialLoad(false);
          
          // If no data was loaded, show an error toast
          if (dogs.length === 0 && !error) {
            toast({
              title: "Loading timeout",
              description: "Could not load dogs in a reasonable time. Please try again.",
              variant: "destructive",
              action: {
                label: "Retry",
                onClick: () => refreshDogs(true),
                className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
              }
            });
          }
        }
      }, 10000); // 10 second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, refetch, isInitialLoad, dogs.length, error, toast, refreshDogs, authLoading]);

  return {
    dogs,
    isLoading: isLoading || isInitialLoad || authLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    fetchDogs: refreshDogs,
    useDogs: () => ({ data: dogs, isLoading: isLoading || isInitialLoad || authLoading, error })
  };
};
