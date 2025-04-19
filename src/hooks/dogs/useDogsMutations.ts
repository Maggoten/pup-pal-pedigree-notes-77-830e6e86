import { useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import * as dogService from '@/services/dogService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseDogsMutations } from './types';

export const useDogsMutations = (userId: string | undefined): UseDogsMutations => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add dog mutation
  const addDogMutation = useMutation({
    mutationFn: async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
      if (!userId) throw new Error('User ID is required');
      return await dogService.addDog(dog, userId);
    },
    onSuccess: (newDog) => {
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return [newDog, ...oldData];
      });
      
      toast({
        title: "Dog added",
        description: `${newDog.name} has been added successfully.`,
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add dog';
      toast({
        title: "Error adding dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Update dog mutation - optimized with retries
  const updateDogMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dog> }) => {
      const updatedDog = await dogService.updateDog(id, updates);
      if (!updatedDog) {
        throw new Error('Failed to update dog');
      }
      return updatedDog;
    },
    retry: 2,
    retryDelay: 1000,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['dogs', userId] });
      const previousDogs = queryClient.getQueryData(['dogs', userId]) as Dog[];
      
      // Optimistically update both the list and the individual dog
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.map(dog => 
          dog.id === id ? { ...dog, ...updates } : dog
        );
      });
      
      return { previousDogs };
    },
    onSuccess: (updatedDog) => {
      // Update both the list and individual dog cache with the server response
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
    onError: (err, variables, context) => {
      if (context?.previousDogs) {
        queryClient.setQueryData(['dogs', userId], context.previousDogs);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dog';
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Delete dog mutation - improved with optimistic updates
  const deleteDogMutation = useMutation({
    mutationFn: async (id: string) => {
      return await dogService.deleteDog(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['dogs', userId] });
      const previousDogs = queryClient.getQueryData(['dogs', userId]) as Dog[];
      
      // Optimistically remove the dog from the cache
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.filter(dog => dog.id !== id);
      });
      
      return { previousDogs };
    },
    onSuccess: (_, id) => {
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
    },
    onError: (err, id, context) => {
      // Rollback to previous state if there was an error
      if (context?.previousDogs) {
        queryClient.setQueryData(['dogs', userId], context.previousDogs);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove dog';
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Always refetch after a delete operation to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ['dogs', userId] });
    }
  });

  return {
    addDog: useCallback(async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
      return await addDogMutation.mutateAsync(dog);
    }, [addDogMutation]),

    updateDog: useCallback(async (id: string, updates: Partial<Dog>) => {
      try {
        return await updateDogMutation.mutateAsync({ id, updates });
      } catch (error) {
        console.error('Error in updateDog:', error);
        return null;
      }
    }, [updateDogMutation]),

    deleteDog: useCallback(async (id: string) => {
      try {
        await deleteDogMutation.mutateAsync(id);
        return true;
      } catch (error) {
        console.error('Error in deleteDog:', error);
        return false;
      }
    }, [deleteDogMutation])
  };
};
