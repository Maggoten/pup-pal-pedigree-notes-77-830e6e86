
import { QueryClient } from '@tanstack/react-query';
import { isMobileDevice } from './fetchUtils';
import { useConnectionStore } from './connectionStatus';

const isMobile = isMobileDevice();

// Platform specific configuration
const mobileCacheTime = 1000 * 60 * 60; // 1 hour for mobile
const desktopCacheTime = 1000 * 60 * 30; // 30 minutes for desktop

const mobileStaleTime = 1000 * 60; // 1 minute for mobile
const desktopStaleTime = 1000 * 60 * 5; // 5 minutes for desktop

// Configure the query client with optimizations for mobile vs desktop
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: !isMobile, // Disable refetch on window focus for mobile
      retry: isMobile ? 3 : 1, // More retries on mobile
      staleTime: isMobile ? mobileStaleTime : desktopStaleTime, // Shorter stale time on mobile
      gcTime: isMobile ? mobileCacheTime : desktopCacheTime, // Longer cache time on mobile (formerly cacheTime)
      // Modern error handling approach
      throwOnError: false,
      refetchOnMount: !isMobile, // Don't always refetch on mount for mobile
      refetchOnReconnect: true,
      // Add network awareness
      networkMode: 'always' // Continue retries regardless of network
    },
    mutations: {
      // Modern error handling approach
      throwOnError: false,
      // Add retry for mutations
      retry: isMobile ? 2 : 1,
      // Add network awareness
      networkMode: 'online'
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
    
    // Skip prefetching if offline
    if (!useConnectionStore.getState().isOnline) {
      console.log('[Query Client] Skipping prefetch due to offline status');
      return;
    }
    
    // For mobile devices, use longer cache times
    const staleTime = isMobile ? mobileStaleTime : desktopStaleTime;
    const gcTime = isMobile ? mobileCacheTime : desktopCacheTime;
    
    // Prefetch active litters
    await queryClient.prefetchQuery({
      queryKey: ['litters', 'active'],
      queryFn: () => fetch('/api/litters/active').then(res => res.json()),
      staleTime,
      gcTime
    });
    
    // For mobile, prefetch more data to have it available offline
    if (isMobile) {
      // Prefetch dogs
      await queryClient.prefetchQuery({
        queryKey: ['dogs'],
        queryFn: () => fetch('/api/dogs').then(res => res.json()),
        staleTime,
        gcTime
      });
      
      // Prefetch planned litters
      await queryClient.prefetchQuery({
        queryKey: ['planned_litters'],
        queryFn: () => fetch('/api/planned-litters').then(res => res.json()),
        staleTime,
        gcTime
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
    // Only refresh if online
    if (!useConnectionStore.getState().isOnline) {
      console.log('[Query Client] Page became visible but offline, skipping refresh');
      return;
    }
    
    console.log('[Query Client] Page became visible, refreshing data');
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }
};

// Function to set query defaults for specific pages
export const setQueryDefaultsForPage = (pageKey: string, options: object) => {
  queryClient.setQueryDefaults([pageKey], options);
};

// Mobile-specific function to optimize queries for offline usage
export const optimizeQueriesForOffline = () => {
  if (!isMobile) return;
  
  console.log('[Query Client] Applying mobile offline optimizations');
  
  // Set longer stale times for common queries
  const criticalQueries = [
    ['dogs'],
    ['litters', 'active'],
    ['planned_litters'],
    ['user', 'profile']
  ];
  
  criticalQueries.forEach(queryKey => {
    queryClient.setQueryDefaults(queryKey, {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    });
  });
};
