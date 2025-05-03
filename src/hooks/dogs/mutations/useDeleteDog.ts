
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog, DogDependencies } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { deleteDog, checkDogDependencies, DeletionMode } from '@/services/dogs';

export function useDeleteDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation to check dog dependencies
  const checkDependenciesMutation = useMutation({
    mutationFn: async (dogId: string) => {
      try {
        const { data, error } = await checkDogDependencies(dogId);
        if (error) throw error;
        return data as DogDependencies;
      } catch (error) {
        console.error('Error checking dependencies:', error);
        throw error;
      }
    }
  });

  // Mutation to delete a dog
  const deleteMutation = useMutation({
    mutationFn: async ({ dogId, mode }: { dogId: string, mode: DeletionMode }) => {
      console.log(`Starting dog deletion process in useDeleteDog with mode: ${mode}`, dogId);
      try {
        const result = await deleteDog(dogId, mode);
        console.log('Dog deletion completed, result:', result);
        return { dogId, mode, result };
      } catch (error) {
        console.error('Error in deletion mutation function:', error);
        throw error; // Re-throw to be caught by onError handler
      }
    },
    onSuccess: ({ dogId, mode }) => {
      console.log(`Dog ${mode} deletion successful in mutation, updating cache for ID:`, dogId);
      
      // For hard deletion, remove from query cache; for soft deletion, just invalidate to refresh
      if (mode === 'hard') {
        queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
          const filteredDogs = oldData.filter(dog => dog.id !== dogId);
          console.log(`Removed dog ${dogId} from cache. Old count: ${oldData.length}, New count: ${filteredDogs.length}`);
          return filteredDogs;
        });
      }
      
      // Invalidate and refetch to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
      
      toast({
        title: mode === 'soft' ? "Dog archived" : "Dog removed",
        description: mode === 'soft' 
          ? "Dog has been archived successfully. It will appear as deleted in the UI but can be restored by an admin."
          : "Dog has been permanently removed successfully.",
      });
    },
    onError: (err, { dogId, mode }) => {
      console.error(`Dog ${mode} deletion error in mutation:`, err, 'Dog ID:', dogId);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove dog';
      
      toast({
        title: `Error ${mode === 'soft' ? 'archiving' : 'removing'} dog`,
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  return {
    checkDependencies: checkDependenciesMutation.mutateAsync,
    deleteDog: deleteMutation.mutateAsync,
    isCheckingDependencies: checkDependenciesMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
