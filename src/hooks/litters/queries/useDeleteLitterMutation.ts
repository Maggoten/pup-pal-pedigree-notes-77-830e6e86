
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Litter } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';
import { litterService } from '@/services/LitterService';
import { littersQueryKey } from './useAddLitterMutation';
import { activeLittersQueryKey } from './useActiveLittersQuery';
import { archivedLittersQueryKey } from './useArchivedLittersQuery';
import { shouldShowErrorToast } from '@/lib/toastConfig';

export const useDeleteLitterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (litterId: string) => litterService.deleteLitter(litterId),
    onMutate: async (litterId) => {
      await queryClient.cancelQueries({ queryKey: littersQueryKey });
      
      // Get snapshot of current data
      const previousActiveLitters = queryClient.getQueryData(activeLittersQueryKey) as Litter[] | undefined;
      const previousArchivedLitters = queryClient.getQueryData(archivedLittersQueryKey) as Litter[] | undefined;
      
      // Optimistically update the cache
      if (previousActiveLitters) {
        queryClient.setQueryData(
          activeLittersQueryKey, 
          previousActiveLitters.filter(litter => litter.id !== litterId)
        );
      }
      
      if (previousArchivedLitters) {
        queryClient.setQueryData(
          archivedLittersQueryKey, 
          previousArchivedLitters.filter(litter => litter.id !== litterId)
        );
      }
      
      return { previousActiveLitters, previousArchivedLitters };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      // Success feedback handled by UI animation - no toast needed
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousActiveLitters) {
        queryClient.setQueryData(activeLittersQueryKey, context.previousActiveLitters);
      }
      if (context?.previousArchivedLitters) {
        queryClient.setQueryData(archivedLittersQueryKey, context.previousArchivedLitters);
      }
      
      // Only show toast for critical errors  
      if (shouldShowErrorToast(error, 'delete_litter')) {
        toast({
          title: "Error Deleting Litter",
          description: error instanceof Error ? error.message : "Failed to delete litter.",
          variant: "destructive"
        });
      }
    }
  });
};
