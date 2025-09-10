
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Puppy } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';
import { litterService } from '@/services/LitterService';
import { shouldShowErrorToast } from '@/lib/toastConfig';

export const useDeletePuppyMutation = (litterId: string) => {
  const queryClient = useQueryClient();
  
  // Query key for caching
  const puppiesQueryKey = ['litters', litterId, 'puppies'];
  
  return useMutation({
    mutationFn: (puppyId: string) => litterService.deletePuppy(puppyId),
    onMutate: async (puppyId) => {
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      
      const previousLitters = queryClient.getQueryData(['litters']);
      
      const litter = queryClient.getQueryData<any>(['litters', litterId]);
      if (litter) {
        queryClient.setQueryData(['litters', litterId], {
          ...litter,
          puppies: litter.puppies.filter((p: Puppy) => p.id !== puppyId)
        });
      }
      
      return { previousLitters };
    },
    onError: (error, _, context) => {
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      // Only show toast for critical errors
      if (shouldShowErrorToast(error, 'delete_puppy')) {
        toast({
          title: 'Error Deleting Puppy',
          description: error instanceof Error ? error.message : 'Failed to delete puppy',
          variant: 'destructive'
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });
};
