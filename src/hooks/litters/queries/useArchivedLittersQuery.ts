
import { useQuery } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';
import { isMobileDevice } from '@/utils/fetchUtils';

// Query key factory
export const archivedLittersQueryKey = ['litters', 'archived'];

export const useArchivedLittersQuery = () => {
  const { user, isAuthReady } = useAuth();
  const isMobile = isMobileDevice();
  
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
    staleTime: isMobile ? 1000 * 60 * 5 : 1000 * 60, // 5 minutes on mobile, 1 minute on desktop
    retry: isMobile ? 3 : 2, // More retries on mobile
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff capped at 30s
    // On mobile, only fetch this data when needed
    refetchOnMount: isMobile ? false : true, // No refetch on mount for mobile
    // On mobile, we shouldn't refetch when window gets focus
    refetchOnWindowFocus: isMobile ? false : true,
    // Network mode for better mobile handling
    networkMode: isMobile ? 'offlineFirst' : 'online',
  });
};
