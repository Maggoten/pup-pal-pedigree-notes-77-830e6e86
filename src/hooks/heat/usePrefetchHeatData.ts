import { useQueryClient } from '@tanstack/react-query';
import { HeatService } from '@/services/HeatService';
import { heatDataKeys } from './useUnifiedHeatDataQuery';

/**
 * Hook for prefetching heat data when user hovers over dog cards or navigates
 */
export const usePrefetchHeatData = () => {
  const queryClient = useQueryClient();

  const prefetchHeatData = (dogId: string) => {
    // Don't prefetch if data is already fresh (less than 2 minutes old)
    const queryState = queryClient.getQueryState(heatDataKeys.unified(dogId));
    const isDataFresh = queryState?.dataUpdatedAt && 
      Date.now() - queryState.dataUpdatedAt < 1000 * 60 * 2;

    if (isDataFresh) {
      return Promise.resolve();
    }

    return queryClient.prefetchQuery({
      queryKey: heatDataKeys.unified(dogId),
      queryFn: () => HeatService.getUnifiedHeatData(dogId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  return { prefetchHeatData };
};