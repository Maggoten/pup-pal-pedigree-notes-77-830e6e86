
import { useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import * as dogService from '@/services/dogService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseDogsMutations } from './types';

export const useDogsMutations = (userId: string | undefined): UseDogsMutations => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add dog mutation
  const addDogMutation = useMutation({
    mutationFn: async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
      return await dogService.addDog(dog, userId!);
    },
    onSuccess: (newDog) => {
      // Update cache with new dog
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return [newDog, ...oldData];
      });
      
      toast({
        title: "Dog added",
        description: `${newDog.name} has been added successfully.`,
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error adding dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Update dog mutation - optimized for speed
  const updateDogMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dog> }) => {
      return await dogService.updateDog(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['dogs', userId] });
      
      // Snapshot the previous value
      const previousDogs = queryClient.getQueryData(['dogs', userId]) as Dog[];
      
      // Optimistically update to the new value
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.map(dog => 
          dog.id === id ? { ...dog, ...updates } : dog
        );
      });
      
      // Return a context object with the snapshot
      return { previousDogs };
    },
    onSuccess: (data, variables) => {
      // Immediately invalidate the query to get fresh data, but don't refetch if we just did
      queryClient.invalidateQueries({ 
        queryKey: ['dogs', userId],
        refetchActive: false
      });
      
      toast({
        title: "Dog updated",
        description: "Dog information has been updated successfully.",
      });
    },
    onError: (err, variables, context) => {
      // If there was an error, revert back to previous dogs
      if (context?.previousDogs) {
        queryClient.setQueryData(['dogs', userId], context.previousDogs);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Delete dog mutation
  const deleteDogMutation = useMutation({
    mutationFn: async (id: string) => {
      return await dogService.deleteDog(id);
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['dogs', userId] });
      
      // Snapshot the previous value
      const previousDogs = queryClient.getQueryData(['dogs', userId]) as Dog[];
      
      // Optimistically remove the dog
      queryClient.setQueryData(['dogs', userId], (oldData: Dog[] = []) => {
        return oldData.filter(dog => dog.id !== id);
      });
      
      // Return a context object with the snapshot
      return { previousDogs };
    },
    onSuccess: () => {
      // Immediately invalidate the query but don't force a refetch
      queryClient.invalidateQueries({ 
        queryKey: ['dogs', userId],
        refetchActive: false
      });
      
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
    },
    onError: (err, id, context) => {
      // If there was an error, revert back to previous dogs
      if (context?.previousDogs) {
        queryClient.setQueryData(['dogs', userId], context.previousDogs);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Wrapper functions to expose the same API as before
  const addDog = useCallback(async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await addDogMutation.mutateAsync(dog);
    } catch (error) {
      console.error('Error in addDog:', error);
      throw error;
    }
  }, [addDogMutation]);

  const updateDog = useCallback(async (id: string, updates: Partial<Dog>) => {
    try {
      await updateDogMutation.mutateAsync({ id, updates });
      return true;
    } catch (error) {
      console.error('Error in updateDog:', error);
      return false;
    }
  }, [updateDogMutation]);

  const deleteDog = useCallback(async (id: string) => {
    try {
      await deleteDogMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Error in deleteDog:', error);
      return false;
    }
  }, [deleteDogMutation]);

  return {
    addDog,
    updateDog,
    deleteDog
  };
};
