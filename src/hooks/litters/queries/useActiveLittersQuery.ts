
import { useQuery } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';

// Query key factory
export const activeLittersQueryKey = ['litters', 'active'];

export const useActiveLittersQuery = () => {
  const { user, isAuthReady } = useAuth();
  
  return useQuery({
    queryKey: activeLittersQueryKey,
    queryFn: async () => {
      // Add more debug logging
      console.log('Fetching active litters for user:', user?.id);
      try {
        const litters = await litterService.getActiveLitters();
        console.log('Retrieved active litters:', litters.length);
        return litters;
      } catch (error) {
        console.error('Error fetching active litters:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isAuthReady,
    staleTime: 1000 * 60, // 1 minute
    retry: 2, // Retry failed queries up to 2 times
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
  });
};
