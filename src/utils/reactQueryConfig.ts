
import { QueryClient } from '@tanstack/react-query';
import { isMobileDevice } from './fetchUtils';

const isMobile = isMobileDevice();

// Configure the query client with optimizations for mobile vs desktop
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: isMobile ? 3 : 1, // More retries on mobile
      staleTime: isMobile ? 1000 * 60 : 1000 * 60 * 5, // Shorter stale time on mobile (1 min vs 5 min)
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Modern error handling approach
      throwOnError: false,
      refetchOnMount: true, // Always refetch on mounting a component
      refetchOnReconnect: true
    },
    mutations: {
      // Modern error handling approach
      throwOnError: false,
      // Add retry for mutations
      retry: isMobile ? 2 : 1
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

// Helper function to prefetch commonly used data with mobile optimizations
export const prefetchCommonData = async (userId: string) => {
  if (!userId) return;
  
  try {
    console.log(`[Query Client] Prefetching common data for user: ${userId}`);
    
    // Prefetch active litters with shorter stale time for mobile
    await queryClient.prefetchQuery({
      queryKey: ['litters', 'active'],
      queryFn: () => fetch('/api/litters/active').then(res => res.json()),
      staleTime: isMobile ? 1000 * 30 : 1000 * 60 * 5 // 30 seconds for mobile
    });
    
    // Prefetch dogs for mobile users (important for several screens)
    if (isMobile) {
      await queryClient.prefetchQuery({
        queryKey: ['dogs'],
        queryFn: () => fetch('/api/dogs').then(res => res.json()),
        staleTime: 1000 * 30 // 30 seconds stale time for mobile
      });
    }
    
    console.log('[Query Client] Prefetching complete');
  } catch (error) {
    console.error('[Query Client] Error prefetching data:', error);
  }
};

// Special function to force refresh data when a page becomes visible
// This is especially important for mobile where app may be backgrounded
export const refreshOnVisibilityChange = (queryKeys: string[][]) => {
  if (document.visibilityState === 'visible') {
    console.log('[Query Client] Page became visible, refreshing data');
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }
};
