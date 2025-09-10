import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HeatService } from '@/services/HeatService';
import { Database } from '@/integrations/supabase/types';
import { isMobileDevice } from '@/utils/fetchUtils';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

export interface UnifiedHeatData {
  heatCycles: HeatCycle[];
  heatHistory: { date: string }[];
  latestDate: Date | null;
}

const isMobile = isMobileDevice();

// Query key factory for heat data
export const heatDataKeys = {
  all: ['heat-data'] as const,
  unified: (dogId: string) => [...heatDataKeys.all, 'unified', dogId] as const,
  cycles: (dogId: string) => [...heatDataKeys.all, 'cycles', dogId] as const,
  history: (dogId: string) => [...heatDataKeys.all, 'history', dogId] as const,
};

/**
 * React Query hook for unified heat data with optimized caching and loading
 */
export const useUnifiedHeatDataQuery = (dogId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: heatDataKeys.unified(dogId || ''),
    queryFn: async (): Promise<UnifiedHeatData> => {
      if (!dogId) {
        return {
          heatCycles: [],
          heatHistory: [],
          latestDate: null
        };
      }

      // Use the existing HeatService method
      return await HeatService.getUnifiedHeatData(dogId);
    },
    enabled: !!dogId,
    staleTime: isMobile ? 1000 * 60 * 2 : 1000 * 60 * 5, // 2 min mobile, 5 min desktop
    gcTime: isMobile ? 1000 * 60 * 10 : 1000 * 60 * 15, // 10 min mobile, 15 min desktop
    retry: isMobile ? 3 : 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: !isMobile,
    refetchOnMount: !isMobile,
    networkMode: isMobile ? 'offlineFirst' : 'online',
    // Enable background refetching for fresh data
    refetchInterval: isMobile ? false : 1000 * 60 * 10, // 10 min background refetch on desktop
  });

  // Prefetch function for proactive loading
  const prefetchHeatData = async (targetDogId: string) => {
    await queryClient.prefetchQuery({
      queryKey: heatDataKeys.unified(targetDogId),
      queryFn: () => HeatService.getUnifiedHeatData(targetDogId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Manual refresh function with cache invalidation
  const refreshHeatData = async (skipCache = false) => {
    if (!dogId) return;

    if (skipCache) {
      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: heatDataKeys.unified(dogId)
      });
    } else {
      // Just refetch
      await query.refetch();
    }
  };

  return {
    data: query.data || {
      heatCycles: [],
      heatHistory: [],
      latestDate: null
    },
    isLoading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : 'Failed to load heat data') : null,
    isError: query.isError,
    isFetching: query.isFetching,
    isStale: query.isStale,
    refresh: refreshHeatData,
    prefetch: prefetchHeatData,
    // Expose raw query for advanced usage
    query
  };
};

// Helper function to prefetch heat data when hovering over dog cards
export const usePrefetchHeatData = () => {
  const queryClient = useQueryClient();

  return (dogId: string) => {
    queryClient.prefetchQuery({
      queryKey: heatDataKeys.unified(dogId),
      queryFn: () => HeatService.getUnifiedHeatData(dogId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
};