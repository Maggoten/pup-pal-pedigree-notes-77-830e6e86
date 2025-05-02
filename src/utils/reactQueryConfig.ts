
import { QueryClient } from '@tanstack/react-query';

// Configure the query client with optimizations to prevent unnecessary renders
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      // Modern error handling approach
      throwOnError: false
    },
    mutations: {
      // Modern error handling approach
      throwOnError: false,
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
