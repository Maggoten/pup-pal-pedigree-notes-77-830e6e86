
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import * as dogService from '@/services/dogService';
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
        const data = await dogService.fetchDogs(userId);
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
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
    retry: 1 // Only retry once on failure
  });

  // fetchDogs is now refetch, renamed for compatibility
  const fetchDogs = useCallback(async (skipCache = false) => {
    if (skipCache) {
      queryClient.removeQueries({ queryKey: ['dogs', userId] });
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
