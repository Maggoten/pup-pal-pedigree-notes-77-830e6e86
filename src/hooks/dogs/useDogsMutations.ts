
import { useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useAddDog, useUpdateDog, useDeleteDog } from './mutations';
import { UseDogsMutations } from './types';

export const useDogsMutations = (userId: string | undefined): UseDogsMutations => {
  const addDogMutation = useAddDog(userId);
  const updateDogMutation = useUpdateDog(userId);
  const deleteDogMutation = useDeleteDog(userId);

  const addDog = useCallback(async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    return await addDogMutation.mutateAsync(dog);
  }, [addDogMutation]);

  const updateDog = useCallback(async (id: string, updates: Partial<Dog>) => {
    return await updateDogMutation.mutateAsync({ id, updates });
  }, [updateDogMutation]);

  const removeDog = useCallback(async (id: string) => {
    try {
      await deleteDogMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  }, [deleteDogMutation]);

  return {
    addDog,
    updateDog,
    removeDog
  };
};
