
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDogs } from '@/services/dogs';
import { UseDogsQueries } from './types';
import { Dog } from '@/types/dogs';
import { useAuth } from '@/hooks/useAuth';

export const useDogsQueries = (): UseDogsQueries => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  
  // Use useQuery to fetch dogs
  const { data = [], isLoading } = useQuery({
    queryKey: ['dogs', userId],
    queryFn: async () => {
      try {
        setError(null);
        if (!userId) {
          return [];
        }
        
        console.log('Fetching dogs for user:', userId);
        return await fetchDogs(userId);
      } catch (err) {
        console.error('Error fetching dogs:', err);
        const errorObj = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(errorObj);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Custom fetch function to be used outside of React component render flow
  const fetchDogsCallback = useCallback(async (skipCache: boolean = false): Promise<Dog[]> => {
    try {
      setError(null);
      if (!userId) {
        return [];
      }

      console.log(`Manual dogs fetch for user ${userId}, skipCache: ${skipCache}`);
      
      if (skipCache) {
        console.log('Invalidating dogs query cache');
        await queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
      }
      
      // Fetch fresh data directly and update cache
      const dogsData = await fetchDogs(userId);
      
      // Update the query cache with the new data
      queryClient.setQueryData(['dogs', userId], dogsData);
      
      return dogsData;
    } catch (err) {
      console.error('Error in manual fetch dogs:', err);
      const errorObj = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(errorObj);
      throw errorObj; // Re-throw for caller to handle
    }
  }, [userId, queryClient]);

  // Provide a hook for use in components
  const useDogs = useCallback(() => {
    return {
      data,
      isLoading,
      error
    };
  }, [data, isLoading, error]);

  return {
    dogs: data,
    isLoading,
    error,
    fetchDogs: fetchDogsCallback,
    useDogs
  };
};
