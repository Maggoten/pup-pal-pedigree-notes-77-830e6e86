
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { deleteDog } from '@/services/dogs';

export function useDeleteDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDog,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.filter(dog => dog.id !== deletedId);
      });
      
      // Invalidate any queries that might depend on the deleted dog
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['planned-litters'] });
      queryClient.invalidateQueries({ queryKey: ['pregnancies'] });
      
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove dog';
      console.error('Dog deletion error:', err);
      
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}
