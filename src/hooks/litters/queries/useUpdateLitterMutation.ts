
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Litter } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';
import { litterService } from '@/services/LitterService';
import { littersQueryKey } from './useAddLitterMutation';
import { activeLittersQueryKey } from './useActiveLittersQuery';
import { archivedLittersQueryKey } from './useArchivedLittersQuery';
import { shouldShowErrorToast } from '@/lib/toastConfig';

export const useUpdateLitterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (litter: Litter) => litterService.updateLitter(litter),
    onMutate: async (updatedLitter) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: littersQueryKey });
      
      // Get snapshot of current data
      const previousActiveLitters = queryClient.getQueryData(activeLittersQueryKey) as Litter[] | undefined;
      const previousArchivedLitters = queryClient.getQueryData(archivedLittersQueryKey) as Litter[] | undefined;
      
      // Optimistically update the cache
      if (updatedLitter.archived && previousArchivedLitters) {
        const newArchivedLitters = [...previousArchivedLitters];
        const existingIndex = newArchivedLitters.findIndex(l => l.id === updatedLitter.id);
        
        if (existingIndex !== -1) {
          newArchivedLitters[existingIndex] = updatedLitter;
        } else {
          newArchivedLitters.push(updatedLitter);
        }
        
        queryClient.setQueryData(archivedLittersQueryKey, newArchivedLitters);
      } else if (!updatedLitter.archived && previousActiveLitters) {
        const newActiveLitters = [...previousActiveLitters];
        const existingIndex = newActiveLitters.findIndex(l => l.id === updatedLitter.id);
        
        if (existingIndex !== -1) {
          newActiveLitters[existingIndex] = updatedLitter;
        } else {
          newActiveLitters.push(updatedLitter);
        }
        
        queryClient.setQueryData(activeLittersQueryKey, newActiveLitters);
      }
      
      return { previousActiveLitters, previousArchivedLitters };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
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
      if (shouldShowErrorToast(error, 'update_litter')) {
        toast({
          title: "Error Updating Litter",
          description: error instanceof Error ? error.message : "Failed to update litter.",
          variant: "destructive"
        });
      }
    }
  });
};
