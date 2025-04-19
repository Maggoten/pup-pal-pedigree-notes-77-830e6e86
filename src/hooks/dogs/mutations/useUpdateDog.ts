
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { updateDog } from '@/services/dogs';

export function useUpdateDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dog> }) => {
      const updatedDog = await updateDog(id, updates);
      if (!updatedDog) {
        throw new Error('Failed to update dog');
      }
      return updatedDog;
    },
    onSuccess: (updatedDog) => {
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.map(dog => 
          dog.id === updatedDog.id ? updatedDog : dog
        );
      });
      
      toast({
        title: "Dog updated",
        description: "Dog information has been updated successfully.",
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dog';
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}
