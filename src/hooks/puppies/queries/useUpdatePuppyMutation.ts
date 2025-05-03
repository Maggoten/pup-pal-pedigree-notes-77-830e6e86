
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';

export const useUpdatePuppyMutation = (litterId: string) => {
  const queryClient = useQueryClient();
  
  // Query key for caching
  const puppiesQueryKey = ['litters', litterId, 'puppies'];
  
  return useMutation({
    mutationFn: (puppy: Puppy) => litterService.updatePuppy(litterId, puppy),
    onMutate: async (updatedPuppy) => {
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      
      const previousLitters = queryClient.getQueryData(['litters']);
      
      const litter = queryClient.getQueryData<any>(['litters', litterId]);
      if (litter) {
        const updatedPuppies = litter.puppies.map((p: Puppy) => 
          p.id === updatedPuppy.id ? updatedPuppy : p
        );
        
        queryClient.setQueryData(['litters', litterId], {
          ...litter,
          puppies: updatedPuppies
        });
      }
      
      return { previousLitters };
    },
    onError: (error, _, context) => {
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      toast({
        title: 'Error Updating Puppy',
        description: error instanceof Error ? error.message : 'Failed to update puppy',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });
};
