
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';
import { littersQueryKey } from './useAddLitterMutation';
import { activeLittersQueryKey } from './useActiveLittersQuery';
import { archivedLittersQueryKey } from './useArchivedLittersQuery';

export const useArchiveLitterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ litterId, archive }: { litterId: string; archive: boolean }) => 
      litterService.toggleArchiveLitter(litterId, archive),
    onMutate: async ({ litterId, archive }) => {
      await queryClient.cancelQueries({ queryKey: littersQueryKey });
      
      const previousActiveLitters = queryClient.getQueryData(activeLittersQueryKey) as Litter[] | undefined;
      const previousArchivedLitters = queryClient.getQueryData(archivedLittersQueryKey) as Litter[] | undefined;
      
      // Find the litter in the appropriate list
      const sourceLitters = archive ? previousActiveLitters : previousArchivedLitters;
      const targetLitters = archive ? previousArchivedLitters : previousActiveLitters;
      
      if (!sourceLitters || !targetLitters) return { previousActiveLitters, previousArchivedLitters };
      
      const litterIndex = sourceLitters.findIndex(l => l.id === litterId);
      if (litterIndex === -1) return { previousActiveLitters, previousArchivedLitters };
      
      // Clone and modify the litter
      const litter = { ...sourceLitters[litterIndex], archived: archive };
      
      // Update both caches
      queryClient.setQueryData(
        archive ? activeLittersQueryKey : archivedLittersQueryKey,
        sourceLitters.filter(l => l.id !== litterId)
      );
      
      queryClient.setQueryData(
        archive ? archivedLittersQueryKey : activeLittersQueryKey,
        [...targetLitters, litter]
      );
      
      return { previousActiveLitters, previousArchivedLitters };
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
    },
    onError: (error, _, context) => {
      if (context?.previousActiveLitters) {
        queryClient.setQueryData(activeLittersQueryKey, context.previousActiveLitters);
      }
      if (context?.previousArchivedLitters) {
        queryClient.setQueryData(archivedLittersQueryKey, context.previousArchivedLitters);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change litter status.",
        variant: "destructive"
      });
    }
  });
};
