
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import { fetchDogs } from '@/services/dogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseDogsQueries } from './types';

export const useDogsQueries = (userId: string | undefined): UseDogsQueries => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Using React Query for better caching and performance
  const {
    data: dogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dogs', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        console.log('Fetching dogs from service...');
        const data = await fetchDogs(userId);
        console.log(`Retrieved ${data.length} dogs`);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
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
    staleTime: 60 * 1000, // Consider data fresh for 1 minute (reduced from 3)
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes (reduced from 10)
  });

  // fetchDogs is now refetch, renamed for compatibility
  const fetchDogs = useCallback(async (skipCache = false) => {
    if (skipCache) {
      // Use direct invalidation instead of removing the query
      await queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
    }
    const result = await refetch();
    return result.data || [];
  }, [refetch, queryClient, userId]);

  useEffect(() => {
    if (userId && isInitialLoad) {
      console.log('Initial load - fetching dogs');
      refetch();
    }
  }, [userId, refetch, isInitialLoad]);

  return {
    dogs,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    fetchDogs
  };
};
