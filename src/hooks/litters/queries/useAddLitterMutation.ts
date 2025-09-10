
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Litter } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';
import { litterService } from '@/services/LitterService';
import { activeLittersQueryKey } from './useActiveLittersQuery';
import { archivedLittersQueryKey } from './useArchivedLittersQuery';
import { shouldShowErrorToast } from '@/lib/toastConfig';

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
      // Only show toast for critical errors
      if (shouldShowErrorToast(error, 'add_litter')) {
        toast({
          title: "Error Adding Litter",
          description: error instanceof Error ? error.message : "Failed to add litter.",
          variant: "destructive"
        });
      }
    }
  });
};
