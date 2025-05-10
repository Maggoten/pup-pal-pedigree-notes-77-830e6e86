
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import { fetchDogs } from '@/services/dogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseDogsQueries } from './types';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { verifySession } from '@/utils/auth/sessionManager';

export const useDogsQueries = (): UseDogsQueries => {
  const { user, isLoading: authLoading, isAuthReady } = useAuth();
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
      
      // Only proceed if auth is ready and we have a valid session
      if (!isAuthReady) {
        console.log('useDogsQueries: Auth not ready yet, delaying fetch');
        return [];
      }
      
      // Verify the session is valid before fetching
      const sessionValid = await verifySession({ skipThrow: true });
      if (!sessionValid) {
        console.log('useDogsQueries: Session verification failed, skipping fetch');
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
    enabled: !!userId && isAuthReady, // Only run query when userId is available AND auth is done loading
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: 2, // Retry failed queries twice
    retryDelay: attempt => Math.min(1000 * Math.pow(2, attempt), 30000), // Exponential backoff
  });

  // Add detailed logging about query status
  useEffect(() => {
    console.log('Dogs query status:', status, 'fetchStatus:', fetchStatus, 'isLoading:', isLoading);
    console.log('Auth loading:', authLoading, 'Auth ready:', isAuthReady, 'Query is enabled:', !!userId && isAuthReady);
  }, [status, fetchStatus, isLoading, userId, authLoading, isAuthReady]);

  // Add visibility change listener to handle page resume/wake
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId && isAuthReady) {
        console.log('Page became visible, checking if dogs data needs refresh');
        // Verify session is valid before refreshing
        verifySession({ skipThrow: true }).then(isValid => {
          if (isValid) {
            // Small delay to allow auth to fully stabilize
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
            }, 500);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, isAuthReady, queryClient]);

  // Improved refresh function with optional skipCache parameter and retry logic
  const refreshDogs = useCallback(async (skipCache = false) => {
    console.log('refreshDogs called with skipCache:', skipCache);
    
    // Only proceed if auth is ready
    if (!isAuthReady) {
      console.log('refreshDogs: Auth not ready yet, will not attempt refresh');
      return [];
    }
    
    // Verify session is valid before refreshing
    const sessionValid = await verifySession();
    if (!sessionValid) {
      console.log('refreshDogs: Session verification failed, will not attempt refresh');
      return [];
    }
    
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
          maxRetries: 3, // Increased from 2 to 3 retries for better recovery
          initialDelay: 1000, // Start with a shorter delay
          onRetry: (attempt) => {
            if (attempt > 1) { // Only show toast after first retry
              toast({
                title: `Retry ${attempt}/3`,
                description: "Reconnecting to fetch dog data..."
              });
            }
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
  }, [refetch, queryClient, userId, toast, isAuthReady]);

  // Add a timeout for the initial load to prevent infinite loading
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (userId && isInitialLoad && isAuthReady) {
      console.log('Initial load - fetching dogs');
      
      // Verify session is valid before refreshing
      verifySession().then(isValid => {
        if (isValid) {
          refetch();
        } else {
          console.log('Initial load - session invalid, skipping fetch');
          setIsInitialLoad(false);
        }
      });
      
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
  }, [userId, refetch, isInitialLoad, dogs.length, error, toast, refreshDogs, isAuthReady]);

  return {
    dogs,
    isLoading: isLoading || isInitialLoad || authLoading || !isAuthReady,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    fetchDogs: refreshDogs,
    useDogs: () => ({ data: dogs, isLoading: isLoading || isInitialLoad || authLoading || !isAuthReady, error })
  };
};
