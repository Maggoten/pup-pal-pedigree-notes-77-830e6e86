
import { QueryClient } from '@tanstack/react-query';
import { isMobileDevice } from './fetchUtils';

// Configure the query client with optimizations to prevent unnecessary renders
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Adaptive retry logic based on error type
        const err = error as Error;
        const errorMsg = err?.message || String(error);
        
        // Don't retry on explicit auth errors
        if (errorMsg.toLowerCase().includes('unauthorized') || 
            errorMsg.toLowerCase().includes('unauthenticated') ||
            errorMsg.includes('401') ||
            errorMsg.includes('auth/invalid-credential')) {
          console.log('[ReactQuery] Not retrying auth error:', errorMsg);
          return false;
        }
        
        // More retries on mobile devices due to potential network issues
        const maxRetries = isMobileDevice() ? 3 : 2;
        return failureCount < maxRetries;
      },
      retryDelay: attempt => Math.min(1000 * Math.pow(1.5, attempt), 30000), // Exponential backoff
      staleTime: 1000 * 60 * 2, // 2 minutes - optimal stale time to reduce fetches
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Modern error handling approach
      throwOnError: false,
      refetchOnMount: true
    },
    mutations: {
      // Modern error handling approach
      throwOnError: false,
      retry: (failureCount, error) => {
        // Don't retry on explicit auth errors
        const err = error as Error;
        const errorMsg = err?.message || String(error);
        
        if (errorMsg.toLowerCase().includes('unauthorized') || 
            errorMsg.toLowerCase().includes('unauthenticated') ||
            errorMsg.includes('401')) {
          return false;
        }
        
        return failureCount < 1;
      }
    }
  }
});

// Performance optimization settings
export const reactQueryDevtoolsOptions = {
  // Only enable in development
  enabled: process.env.NODE_ENV === 'development',
  // Position at bottom of screen
  position: 'bottom',
  // Start closed
  initialIsOpen: false,
};

// Helper function to reset the QueryClient - useful for logout
export const resetQueryClient = () => {
  queryClient.clear();
};

// Helper function to prefetch commonly used data
export const prefetchCommonData = async (userId: string) => {
  if (!userId) return;
  
  try {
    console.log('[ReactQuery] Prefetching common data for user:', userId);
    
    // Prefetch dogs
    await queryClient.prefetchQuery({
      queryKey: ['dogs', userId],
      queryFn: () => fetch('/api/dogs').then(res => res.json())
    });
    
    // Prefetch active litters
    await queryClient.prefetchQuery({
      queryKey: ['litters', 'active'],
      queryFn: () => fetch('/api/litters/active').then(res => res.json())
    });
    
    // Prefetch planned litters
    await queryClient.prefetchQuery({
      queryKey: ['planned_litters'],
      queryFn: () => fetch('/api/planned-litters').then(res => res.json())
    });
    
    console.log('[ReactQuery] Common data prefetch complete');
  } catch (error) {
    console.error('[ReactQuery] Error prefetching data:', error);
  }
};

// Helper to invalidate all user-scoped queries
export const invalidateUserData = () => {
  console.log('[ReactQuery] Invalidating all user data queries');
  
  // Invalidate all major data entities
  queryClient.invalidateQueries({ queryKey: ['dogs'] });
  queryClient.invalidateQueries({ queryKey: ['litters'] });
  queryClient.invalidateQueries({ queryKey: ['planned_litters'] });
  queryClient.invalidateQueries({ queryKey: ['pregnancies'] });
  queryClient.invalidateQueries({ queryKey: ['calendars'] });
  queryClient.invalidateQueries({ queryKey: ['reminders'] });
};

// Helper to handle auth state changes
export const handleAuthStateChange = (event: string, userId?: string) => {
  console.log(`[ReactQuery] Auth state changed: ${event}`);
  
  if (event === 'SIGNED_IN' && userId) {
    // Invalidate data and prefetch on sign in
    invalidateUserData();
    prefetchCommonData(userId);
  } else if (event === 'SIGNED_OUT') {
    // Clear all cache on sign out
    resetQueryClient();
  }
};
