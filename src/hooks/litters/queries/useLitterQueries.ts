
import { useCallback } from 'react';
import { Litter } from '@/types/breeding';
import { useActiveLittersQuery } from './useActiveLittersQuery';
import { useArchivedLittersQuery } from './useArchivedLittersQuery';
import { useAddLitterMutation } from './useAddLitterMutation';
import { useUpdateLitterMutation } from './useUpdateLitterMutation';
import { useDeleteLitterMutation } from './useDeleteLitterMutation';
import { useArchiveLitterMutation } from './useArchiveLitterMutation';
import { useAvailableYears } from './useAvailableYears';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from './useAddLitterMutation';
import { toast } from '@/hooks/use-toast';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { isMobileDevice } from '@/utils/fetchUtils';

// This is the main hook that combines all the other hooks
export const useLitterQueries = () => {
  const activeLittersQuery = useActiveLittersQuery();
  const archivedLittersQuery = useArchivedLittersQuery();
  const queryClient = useQueryClient();
  const isMobile = isMobileDevice();
  
  const addLitterMutation = useAddLitterMutation();
  const updateLitterMutation = useUpdateLitterMutation();
  const deleteLitterMutation = useDeleteLitterMutation();
  const archiveLitterMutation = useArchiveLitterMutation();
  
  const getAvailableYears = useAvailableYears();
  
  // Helper function to determine if we have valid data
  const isDataReady = useCallback(() => {
    return activeLittersQuery.isSuccess && archivedLittersQuery.isSuccess;
  }, [activeLittersQuery.isSuccess, archivedLittersQuery.isSuccess]);
  
  // Force refresh all litter data with mobile-specific options
  const refreshLitters = useCallback(async () => {
    try {
      console.log('Manually refreshing all litters data');
      
      // Show toast only on mobile since mobile users expect more visual feedback
      if (isMobile) {
        toast({
          title: "Refreshing data...",
          description: "Loading your latest litter information",
          duration: 2000,
        });
      }
      
      // Invalidate the queries first
      await queryClient.invalidateQueries({ queryKey: littersQueryKey });
      
      // Then refetch with retry logic - more retries on mobile
      const maxRetries = isMobile ? 3 : 2;
      
      const [activeResult, archivedResult] = await Promise.all([
        fetchWithRetry(() => activeLittersQuery.refetch(), { 
          maxRetries,
          initialDelay: isMobile ? 1000 : 1500 // Shorter initial delay on mobile for better UX
        }),
        fetchWithRetry(() => archivedLittersQuery.refetch(), { maxRetries })
      ]);
      
      console.log('Litters refresh completed', {
        active: activeResult.data?.length || 0,
        archived: archivedResult.data?.length || 0
      });
      
      return {
        active: activeResult.data || [],
        archived: archivedResult.data || []
      };
    } catch (error) {
      console.error('Failed to refresh litters:', error);
      
      toast({
        title: "Refresh failed",
        description: "Could not reload litters data. Please try again.",
        variant: "destructive",
        action: {
          label: "Retry",
          onClick: refreshLitters,
          className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
        }
      });
      
      // Return current data as fallback
      return {
        active: activeLittersQuery.data || [],
        archived: archivedLittersQuery.data || []
      };
    }
  }, [queryClient, activeLittersQuery, archivedLittersQuery, isMobile]);

  // Export an object with all the queries and mutations
  return {
    activeLitters: activeLittersQuery.data || [],
    archivedLitters: archivedLittersQuery.data || [],
    isLoading: activeLittersQuery.isLoading || archivedLittersQuery.isLoading,
    isError: activeLittersQuery.isError || archivedLittersQuery.isError,
    error: activeLittersQuery.error || archivedLittersQuery.error,
    
    addLitter: addLitterMutation.mutate,
    updateLitter: updateLitterMutation.mutate,
    deleteLitter: deleteLitterMutation.mutate,
    archiveLitter: (litterId: string, archive: boolean) => 
      archiveLitterMutation.mutate({ litterId, archive }),
    
    isAddingLitter: addLitterMutation.isPending,
    isUpdatingLitter: updateLitterMutation.isPending,
    isDeletingLitter: deleteLitterMutation.isPending,
    isArchivingLitter: archiveLitterMutation.isPending,
    
    getAvailableYears,
    isDataReady,
    refreshLitters
  };
};

export default useLitterQueries;
