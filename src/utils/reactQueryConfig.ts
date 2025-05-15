
import { QueryClient } from '@tanstack/react-query';
import { isMobileDevice } from './fetchUtils';

const isMobile = isMobileDevice();

// Configure the query client with optimizations for mobile vs desktop
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: isMobile ? false : true, // Disable window focus refetches on mobile
      retry: isMobile ? 3 : 1, // More retries on mobile
      staleTime: isMobile ? 1000 * 60 * 2 : 1000 * 60 * 5, // 2 min on mobile vs 5 min on desktop
      gcTime: isMobile ? 1000 * 60 * 15 : 1000 * 60 * 30, // 15 min on mobile vs 30 min on desktop
      // Modern error handling approach
      throwOnError: false,
      refetchOnMount: isMobile ? false : true, // No refetch on mount for mobile
      refetchOnReconnect: true,
      // Reduce network pressure on mobile
      networkMode: isMobile ? 'offlineFirst' : 'online'
    },
    mutations: {
      // Modern error handling approach
      throwOnError: false,
      // Add retry for mutations
      retry: isMobile ? 2 : 1,
      // Network mode for mutations
      networkMode: isMobile ? 'offlineFirst' : 'online'
    }
  }
});

// Performance optimization settings
export const reactQueryDevtoolsOptions = {
  // Only enable in development and never on mobile
  enabled: process.env.NODE_ENV === 'development' && !isMobile,
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
    
    // Don't prefetch as much data on mobile
    if (!isMobile) {
      // Prefetch active litters with shorter stale time for mobile
      await queryClient.prefetchQuery({
        queryKey: ['litters', 'active'],
        queryFn: () => fetch('/api/litters/active').then(res => res.json()),
        staleTime: 1000 * 60 * 5 // 5 minutes
      });
      
      // Prefetch planned litters (only on desktop)
      await queryClient.prefetchQuery({
        queryKey: ['planned-litters'],
        queryFn: () => fetch('/api/planned-litters').then(res => res.json()),
        staleTime: 1000 * 60 * 5 // 5 minutes
      });
    } else {
      // On mobile, only prefetch dogs which are needed on many screens
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
  // On mobile, we're more conservative with refetching
  if (isMobile) {
    // Check if we've been in background for at least 5 minutes
    const lastActiveTime = parseInt(localStorage.getItem('app_last_active_time') || '0', 10);
    const now = Date.now();
    const inactiveTime = now - lastActiveTime;
    
    // Only refetch if inactive for more than 5 minutes
    if (lastActiveTime > 0 && inactiveTime > 1000 * 60 * 5) {
      console.log(`[Query Client] App was inactive for ${Math.round(inactiveTime / 1000 / 60)} minutes, refreshing data`);
      localStorage.setItem('app_last_active_time', now.toString());
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  } else if (document.visibilityState === 'visible') {
    // On desktop, refresh whenever page becomes visible
    console.log('[Query Client] Page became visible, refreshing data');
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }
};

// Track app active state for mobile optimization
export const trackAppActiveState = () => {
  if (isMobile) {
    // Set current time when app becomes visible
    if (document.visibilityState === 'visible') {
      localStorage.setItem('app_last_active_time', Date.now().toString());
    }
  }
};

// Initialize visibility tracking
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', trackAppActiveState);
}
