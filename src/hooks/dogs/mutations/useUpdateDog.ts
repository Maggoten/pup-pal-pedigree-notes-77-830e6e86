

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { updateDog } from '@/services/dogs';
import { isTimeoutError } from '@/utils/timeoutUtils';

export function useUpdateDog(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dog> }) => {
      console.log('useUpdateDog mutation called with:', { id, updates });
      
      try {
        const updatedDog = await updateDog(id, updates);
        if (!updatedDog) {
          throw new Error('Failed to update dog: No data returned');
        }
        return updatedDog;
      } catch (error) {
        console.error('Error in updateDog service call:', error);
        
        // Provide a more user-friendly error message for timeouts
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            throw new Error('Update timed out. Please try again with fewer changes or check your connection.');
          }
        }
        throw error;
      }
    },
    onSuccess: (updatedDog) => {
      console.log('Dog update successful:', updatedDog);
      
      // Update the cache with the new data
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.map(dog => 
          dog.id === updatedDog.id ? updatedDog : dog
        );
      });
      
      toast({
        title: "Success",
        description: "Dog information has been updated successfully.",
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update dog';
      
      console.error('Error in updateDog mutation:', errorMessage);
      
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}
