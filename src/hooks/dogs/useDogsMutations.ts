
import { useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useAddDog, useUpdateDog, useDeleteDog } from './mutations';
import { UseDogsMutations } from './types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useDogsMutations = (): UseDogsMutations => {
  const { user } = useAuth();
  const userId = user?.id;
  const { toast } = useToast();
  const addDogMutation = useAddDog(userId);
  const updateDogMutation = useUpdateDog(userId);
  const deleteDogMutation = useDeleteDog(userId);

  const addDog = useCallback(async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useDogsMutations.addDog called with:', dog);
      return await addDogMutation.mutateAsync(dog);
    } catch (error) {
      console.error('Error in addDog:', error);
      toast({
        title: "Error adding dog",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  }, [addDogMutation, toast]);

  const updateDog = useCallback(async (id: string, updates: Partial<Dog>) => {
    try {
      console.log('useDogsMutations.updateDog called with ID:', id, 'Updates:', updates);
      return await updateDogMutation.mutateAsync({ id, updates });
    } catch (error) {
      console.error('Error in updateDog:', error);
      toast({
        title: "Error updating dog",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return null;
    }
  }, [updateDogMutation, toast]);

  const deleteDog = useCallback(async (id: string) => {
    try {
      console.log('useDogsMutations.deleteDog called with ID:', id);
      await deleteDogMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Error in deleteDog:', error);
      toast({
        title: "Error deleting dog",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  }, [deleteDogMutation, toast]);

  return {
    addDog,
    updateDog,
    deleteDog
  };
};
