
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';

export const useAddPuppyMutation = (litterId: string) => {
  const queryClient = useQueryClient();
  
  // Query key for caching
  const puppiesQueryKey = ['litters', litterId, 'puppies'];
  
  return useMutation({
    mutationFn: (puppy: Puppy) => litterService.addPuppy(litterId, puppy),
    onMutate: async (newPuppy) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      
      // Get current data
      const previousLitters = queryClient.getQueryData(['litters']);
      
      // Update the cache optimistically
      const litter = queryClient.getQueryData<any>(['litters', litterId]);
      if (litter) {
        queryClient.setQueryData(['litters', litterId], {
          ...litter,
          puppies: [...(litter.puppies || []), newPuppy]
        });
      }
      
      return { previousLitters };
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      toast({
        title: 'Error Adding Puppy',
        description: error instanceof Error ? error.message : 'Failed to add puppy',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });
};
