
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { addDog } from '@/services/dogs';
import { shouldShowErrorToast } from '@/lib/toastConfig';

export function useAddDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
      if (!userId) throw new Error('User ID is required');
      return await addDog(dog, userId);
    },
    onSuccess: (newDog) => {
      queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
      // Success feedback handled by form component - no toast needed
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add dog';
      
      // Only show toast for critical errors (auth, network, etc.)
      if (shouldShowErrorToast(err, 'add_dog')) {
        toast({
          title: "Error adding dog",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  });
}
