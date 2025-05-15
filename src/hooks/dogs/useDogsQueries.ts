
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import { fetchDogs } from '@/services/dogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseDogsQueries } from './types';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';

export const useDogsQueries = (): UseDogsQueries => {
  const { user, isLoading: authLoading, isAuthReady } = useAuth();
  const userId = user?.id;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = isMobileDevice();
  
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
      
      // Special handling for mobile: add a brief delay for auth stabilization
      if (isMobile && isAuthReady) {
        console.log('useDogsQueries: Adding brief delay for mobile auth stabilization');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Only proceed if auth is ready and we have a valid session
      if (!isAuthReady) {
        console.log('useDogsQueries: Auth not ready yet, delaying fetch');
        return [];
      }
      
      try {
        console.log('Fetching dogs from service for user:', userId);
        // Remove the userId parameter as it's not expected in the fetchDogs function
        const data = await fetchDogs();
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
    staleTime: isMobile ? 30 * 1000 : 60 * 1000, // Consider data fresh for 30s on mobile, 1 min on desktop
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: isMobile ? 3 : 2, // More retries on mobile
    retryDelay: attempt => {
      // Use different backoff strategies for mobile vs desktop
      const baseDelay = isMobile ? 800 : 1000; // Start with a shorter delay on mobile
      return Math.min(baseDelay * Math.pow(1.8, attempt), 30000); // Exponential backoff
    },
  });

  // Add detailed logging about query status
  useEffect(() => {
    console.log('Dogs query status:', status, 'fetchStatus:', fetchStatus, 'isLoading:', isLoading);
    console.log('Auth loading:', authLoading, 'Auth ready:', isAuthReady, 'Query is enabled:', !!userId && isAuthReady);
    
    // Special handling for mobile when no dogs are found but should be
    if (isAuthReady && !authLoading && userId && dogs.length === 0 && !isLoading && !error && !isInitialLoad && isMobile) {
      console.log('Mobile: No dogs found after auth ready, might need to retry');
      
      // Add a timeout to retry once more on mobile after a short delay
      // This helps in cases where auth appears ready but session isn't fully stabilized
      const mobileRetryTimer = setTimeout(() => {
        console.log('Mobile: Executing extra fetch retry after delay');
        refetch().catch(err => {
          console.warn('Mobile extra retry failed:', err);
        });
      }, 1500);
      
      return () => clearTimeout(mobileRetryTimer);
    }
  }, [status, fetchStatus, isLoading, userId, authLoading, isAuthReady, dogs.length, error, isInitialLoad, isMobile, refetch]);

  // Add visibility change listener to handle page resume/wake
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId && isAuthReady) {
        console.log('Page became visible, checking if dogs data needs refresh');
        
        // Longer delay for mobile devices to ensure stability after resuming
        const delay = isMobile ? 800 : 500;
        
        // Small delay to allow auth to fully stabilize
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
        }, delay);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, isAuthReady, queryClient, isMobile]);

  // Improved refresh function with optional skipCache parameter and retry logic
  const refreshDogs = useCallback(async (skipCache = false) => {
    console.log('refreshDogs called with skipCache:', skipCache);
    
    // Only proceed if auth is ready
    if (!isAuthReady) {
      console.log('refreshDogs: Auth not ready yet, will not attempt refresh');
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
          maxRetries: isMobile ? 4 : 3, // More retries on mobile
          initialDelay: isMobile ? 800 : 1000, // Start with a shorter delay on mobile
          useBackoff: true, // Use exponential backoff
          onRetry: (attempt) => {
            if (attempt > 1) { // Only show toast after first retry
              toast({
                title: `Retry ${attempt}/${isMobile ? 4 : 3}`,
                description: isMobile ? 
                  "Reconnecting to mobile network..." : 
                  "Reconnecting to fetch dog data..."
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
  }, [refetch, queryClient, userId, toast, isAuthReady, isMobile]);

  // Add a timeout for the initial load to prevent infinite loading
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (userId && isInitialLoad && isAuthReady) {
      console.log('Initial load - fetching dogs');
      refetch();
      
      // Set a timeout to stop the initial loading state after 10 seconds (longer on mobile)
      const timeout = isMobile ? 15000 : 10000; // 15 seconds for mobile, 10 for desktop
      
      timeoutId = setTimeout(() => {
        if (isInitialLoad) {
          console.log(`Initial load timeout reached (${isMobile ? 'mobile' : 'desktop'}), resetting loading state`);
          setIsInitialLoad(false);
          
          // If no data was loaded, show an error toast
          if (dogs.length === 0 && !error) {
            toast({
              title: "Loading timeout",
              description: isMobile ? 
                "Could not load dogs on mobile connection. Please check your connection and try again." :
                "Could not load dogs in a reasonable time. Please try again.",
              variant: "destructive",
              action: {
                label: "Retry",
                onClick: () => refreshDogs(true),
                className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
              }
            });
          }
        }
      }, timeout);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, refetch, isInitialLoad, dogs.length, error, toast, refreshDogs, isAuthReady, isMobile]);

  return {
    dogs,
    isLoading: isLoading || isInitialLoad || authLoading || !isAuthReady,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    fetchDogs: refreshDogs,
    useDogs: () => ({ data: dogs, isLoading: isLoading || isInitialLoad || authLoading || !isAuthReady, error })
  };
};
