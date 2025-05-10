
import { useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useAddDog, useUpdateDog, useDeleteDog } from './mutations';
import { UseDogsMutations } from './types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useDogsMutations = (): UseDogsMutations => {
  const { user, supabaseUser, isAuthReady } = useAuth();
  const userId = user?.id || supabaseUser?.id;
  const { toast } = useToast();
  const addDogMutation = useAddDog(userId);
  const updateDogMutation = useUpdateDog(userId);
  const deleteDogMutation = useDeleteDog(userId);

  const addDog = useCallback(async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check if auth is ready before proceeding
      if (!isAuthReady) {
        console.log('Auth not ready yet, delaying dog addition');
        toast({
          title: "Please wait",
          description: "Preparing your account. Please try again in a moment.",
        });
        return null;
      }

      // Use either user.id or supabaseUser.id
      const ownerId = user?.id || supabaseUser?.id;
      if (!ownerId) {
        console.error('Cannot add dog: No authenticated user found');
        toast({
          title: "Authentication required",
          description: "You need to be logged in to add a dog",
          variant: "destructive"
        });
        return null;
      }

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
  }, [addDogMutation, toast, user, supabaseUser, isAuthReady]);

  const updateDog = useCallback(async (id: string, updates: Partial<Dog>) => {
    try {
      // Check if auth is ready before proceeding
      if (!isAuthReady) {
        console.log('Auth not ready yet, delaying dog update');
        toast({
          title: "Please wait",
          description: "Preparing your account. Please try again in a moment.",
        });
        return null;
      }

      // Use either user.id or supabaseUser.id
      const ownerId = user?.id || supabaseUser?.id;
      if (!ownerId) {
        console.error('Cannot update dog: No authenticated user found');
        toast({
          title: "Authentication required",
          description: "You need to be logged in to update a dog",
          variant: "destructive"
        });
        return null;
      }

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
  }, [updateDogMutation, toast, user, supabaseUser, isAuthReady]);

  const deleteDog = useCallback(async (id: string) => {
    try {
      // Check if auth is ready before proceeding
      if (!isAuthReady) {
        console.log('Auth not ready yet, delaying dog deletion');
        toast({
          title: "Please wait",
          description: "Preparing your account. Please try again in a moment.",
        });
        return false;
      }

      // Use either user.id or supabaseUser.id
      const ownerId = user?.id || supabaseUser?.id;
      if (!ownerId) {
        console.error('Cannot delete dog: No authenticated user found');
        toast({
          title: "Authentication required",
          description: "You need to be logged in to delete a dog",
          variant: "destructive"
        });
        return false;
      }

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
  }, [deleteDogMutation, toast, user, supabaseUser, isAuthReady]);

  return {
    addDog,
    updateDog,
    deleteDog
  };
};
