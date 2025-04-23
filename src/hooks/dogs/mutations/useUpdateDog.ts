
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { updateDog } from '@/services/dogs';

export function useUpdateDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dog> }) => {
      console.log('useUpdateDog mutation called with:', { id, updates });
      const updatedDog = await updateDog(id, updates);
      if (!updatedDog) {
        throw new Error('Failed to update dog');
      }
      return updatedDog;
    },
    onSuccess: (updatedDog) => {
      console.log('Dog update successful:', updatedDog);
      
      // Update the cache with the new data
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        console.log('Updating query cache with new dog data');
        return oldData.map(dog => 
          dog.id === updatedDog.id ? updatedDog : dog
        );
      });
      
      // Force a refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
      
      toast({
        title: "Dog updated",
        description: "Dog information has been updated successfully.",
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dog';
      console.error('Error in updateDog mutation:', errorMessage);
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}
