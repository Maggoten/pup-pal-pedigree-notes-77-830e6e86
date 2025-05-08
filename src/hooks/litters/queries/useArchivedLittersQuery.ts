
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
      // Verify auth state before fetching
      if (!isAuthReady) {
        console.log('Skipping archived litters fetch - auth not ready');
        return [];
      }
      
      // Add more debug logging
      console.log('Fetching archived litters for user:', user?.id);
      try {
        const litters = await litterService.getArchivedLitters();
        console.log('Retrieved archived litters:', litters.length);
        return litters;
      } catch (error) {
        // Check if error is auth-related
        const errorMsg = error instanceof Error ? error.message : String(error);
        const isAuthError = ['401', 'JWT', 'auth', 'unauthorized', 'token'].some(code => 
          errorMsg.toLowerCase().includes(code.toLowerCase()));
        
        if (isAuthError) {
          console.warn('Auth-related error detected in archived litters query');
          return []; // Return empty array for auth errors
        }
        
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
