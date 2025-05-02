
import { QueryClient } from '@tanstack/react-query';

// Configure the query client with optimizations to prevent unnecessary renders
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 10, // 10 minutes
      // Prevent suspense in SSR/initial load
      suspense: false,
      // Use callback to handle errors at query level
      useErrorBoundary: false
    },
    mutations: {
      // Use callback to handle errors at mutation level
      useErrorBoundary: false,
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
