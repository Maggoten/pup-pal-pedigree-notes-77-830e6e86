
import { useQuery } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';

// Query key factory
export const archivedLittersQueryKey = ['litters', 'archived'];

export const useArchivedLittersQuery = () => {
  const { user, isAuthReady } = useAuth();
  
  return useQuery({
    queryKey: archivedLittersQueryKey,
    queryFn: async () => {
      // Add more debug logging
      console.log('Fetching archived litters for user:', user?.id);
      try {
        const litters = await litterService.getArchivedLitters();
        console.log('Retrieved archived litters:', litters.length);
        return litters;
      } catch (error) {
        console.error('Error fetching archived litters:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isAuthReady,
    staleTime: 1000 * 60, // 1 minute
    retry: 2, // Retry failed queries up to 2 times
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
  });
};
