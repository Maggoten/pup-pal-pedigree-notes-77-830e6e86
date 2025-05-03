
import { QueryClient } from '@tanstack/react-query';

// Configure the query client with optimizations to prevent unnecessary renders
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes - increase stale time to reduce fetches
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Modern error handling approach
      throwOnError: false,
      refetchOnMount: 'always'
    },
    mutations: {
      // Modern error handling approach
      throwOnError: false,
      // Add retry for mutations
      retry: 1
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
    // Prefetch active litters
    await queryClient.prefetchQuery({
      queryKey: ['litters', 'active'],
      queryFn: () => fetch('/api/litters/active').then(res => res.json())
    });
    
    // You can add more prefetch operations here for other commonly accessed data
  } catch (error) {
    console.error('Error prefetching data:', error);
  }
};
