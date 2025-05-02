
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { deleteDog } from '@/services/dogs';

export function useDeleteDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dogId: string) => {
      console.log('Starting dog deletion process in useDeleteDog:', dogId);
      try {
        const result = await deleteDog(dogId);
        console.log('Dog deletion completed, result:', result);
        return { dogId, result };
      } catch (error) {
        console.error('Error in deletion mutation function:', error);
        throw error; // Re-throw to be caught by onError handler
      }
    },
    onSuccess: ({ dogId }) => {
      console.log('Dog deletion successful in mutation, updating cache for ID:', dogId);
      
      // Update the query cache
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        const filteredDogs = oldData.filter(dog => dog.id !== dogId);
        console.log(`Removed dog ${dogId} from cache. Old count: ${oldData.length}, New count: ${filteredDogs.length}`);
        return filteredDogs;
      });
      
      // Invalidate and refetch to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
      
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
    },
    onError: (err, dogId) => {
      console.error('Dog deletion error in mutation:', err, 'Dog ID:', dogId);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove dog';
      
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}
