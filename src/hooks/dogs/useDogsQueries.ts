
import { useEffect, useCallback } from 'react';
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
        const data = await fetchDogs();
        console.log(`Retrieved ${data.length} dogs for user ${userId}`);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching dogs:', errorMessage);
        throw err;
      }
    },
    enabled: !!userId && isAuthReady,
    staleTime: isMobile ? 30 * 1000 : 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: isMobile ? 3 : 2,
    retryDelay: attempt => {
      const baseDelay = isMobile ? 800 : 1000;
      return Math.min(baseDelay * Math.pow(1.8, attempt), 30000);
    },
    refetchOnWindowFocus: true, // Use React Query's built-in refetch on focus
  });

  // Simplified logging about query status
  useEffect(() => {
    console.log('Dogs query status:', status, 'fetchStatus:', fetchStatus, 'isLoading:', isLoading);
    console.log('Auth loading:', authLoading, 'Auth ready:', isAuthReady, 'Query is enabled:', !!userId && isAuthReady);
  }, [status, fetchStatus, isLoading, userId, authLoading, isAuthReady]);


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


  return {
    dogs,
    isLoading: isLoading || authLoading || !isAuthReady,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    fetchDogs: refreshDogs,
    useDogs: () => ({ data: dogs, isLoading: isLoading || authLoading || !isAuthReady, error })
  };
};
