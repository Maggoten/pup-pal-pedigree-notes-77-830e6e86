
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';
import { activeLittersQueryKey } from './useActiveLittersQuery';
import { archivedLittersQueryKey } from './useArchivedLittersQuery';

// Common query key for all litter operations
export const littersQueryKey = ['litters'];

export const useAddLitterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (litter: Litter) => litterService.addLitter(litter),
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Litter",
        description: error instanceof Error ? error.message : "Failed to add litter.",
        variant: "destructive"
      });
    }
  });
};
