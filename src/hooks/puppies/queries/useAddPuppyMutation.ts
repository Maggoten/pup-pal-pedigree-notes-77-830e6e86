
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Puppy } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';
import { litterService } from '@/services/LitterService';
import { shouldShowErrorToast } from '@/lib/toastConfig';

export const useAddPuppyMutation = (litterId: string) => {
  const queryClient = useQueryClient();
  
  // Query keys for caching
  const puppiesQueryKey = ['litters', litterId, 'puppies'];
  const litterQueryKey = ['litters', litterId];
  
  return useMutation({
    mutationFn: (puppy: Puppy) => litterService.addPuppy(litterId, puppy),
    onMutate: async (newPuppy) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      await queryClient.cancelQueries({ queryKey: litterQueryKey });
      
      // Get current data
      const previousLitters = queryClient.getQueryData(['litters']);
      const previousLitter = queryClient.getQueryData<any>(litterQueryKey);
      
      // Update the cache optimistically for the specific litter
      if (previousLitter) {
        const updatedLitter = {
          ...previousLitter,
          puppies: [...(previousLitter.puppies || []), newPuppy]
        };
        
        queryClient.setQueryData(litterQueryKey, updatedLitter);
        
        // Also update the litter in the list of all litters
        if (previousLitters) {
          const allLitters = [...previousLitters as any[]];
          const litterIndex = allLitters.findIndex(l => l.id === litterId);
          
          if (litterIndex >= 0) {
            allLitters[litterIndex] = updatedLitter;
            queryClient.setQueryData(['litters'], allLitters);
          }
        }
      }
      
      return { previousLitters, previousLitter };
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousLitter) {
        queryClient.setQueryData(litterQueryKey, context.previousLitter);
      }
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      
      // Only show toast for critical errors
      if (shouldShowErrorToast(error, 'add_puppy')) {
        toast({
          title: 'Error Adding Puppy',
          description: error instanceof Error ? error.message : 'Failed to add puppy',
          variant: 'destructive'
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: litterQueryKey });
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });
};
