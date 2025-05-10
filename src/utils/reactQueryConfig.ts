
import { QueryClient } from '@tanstack/react-query';

// Configure the query client with optimizations to prevent unnecessary renders
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes - optimal stale time to reduce fetches
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Modern error handling approach
      throwOnError: false,
      refetchOnMount: true
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
  } catch (error) {
    console.error('Error prefetching data:', error);
  }
};
