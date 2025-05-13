
import { useQuery } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';
import { Litter } from '@/types/breeding';

// Query key factory
export const activeLittersQueryKey = ['litters', 'active'];

export const useActiveLittersQuery = () => {
  const { user, isAuthReady } = useAuth();
  
  return useQuery<Litter[], Error>({
    queryKey: activeLittersQueryKey,
    queryFn: async () => {
      // Verify auth state before fetching
      if (!isAuthReady) {
        console.log('Skipping active litters fetch - auth not ready');
        return [];
      }
      
      // Add more debug logging
      console.log('Fetching active litters for user:', user?.id);
      try {
        const litters = await litterService.getActiveLitters();
        console.log('Retrieved active litters:', litters.length);
        return litters;
      } catch (error) {
        // Check if error is auth-related
        const errorMsg = error instanceof Error ? error.message : String(error);
        const isAuthError = ['401', 'JWT', 'auth', 'unauthorized', 'token'].some(code => 
          errorMsg.toLowerCase().includes(code.toLowerCase()));
        
        if (isAuthError) {
          console.warn('Auth-related error detected in active litters query');
          return []; // Return empty array for auth errors
        }
        
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
