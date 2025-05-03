
import { useCallback } from 'react';
import { Litter } from '@/types/breeding';
import { useActiveLittersQuery } from './useActiveLittersQuery';
import { useArchivedLittersQuery } from './useArchivedLittersQuery';
import { useAddLitterMutation } from './useAddLitterMutation';
import { useUpdateLitterMutation } from './useUpdateLitterMutation';
import { useDeleteLitterMutation } from './useDeleteLitterMutation';
import { useArchiveLitterMutation } from './useArchiveLitterMutation';
import { useAvailableYears } from './useAvailableYears';

// This is the main hook that combines all the other hooks
export const useLitterQueries = () => {
  const activeLittersQuery = useActiveLittersQuery();
  const archivedLittersQuery = useArchivedLittersQuery();
  
  const addLitterMutation = useAddLitterMutation();
  const updateLitterMutation = useUpdateLitterMutation();
  const deleteLitterMutation = useDeleteLitterMutation();
  const archiveLitterMutation = useArchiveLitterMutation();
  
  const getAvailableYears = useAvailableYears();
  
  // Helper function to determine if we have valid data
  const isDataReady = useCallback(() => {
    return activeLittersQuery.isSuccess && archivedLittersQuery.isSuccess;
  }, [activeLittersQuery.isSuccess, archivedLittersQuery.isSuccess]);

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
    isDataReady
  };
};

export default useLitterQueries;
