
import { useCallback } from 'react';
import { Puppy } from '@/types/breeding';
import { useAddPuppyMutation } from './useAddPuppyMutation';
import { useUpdatePuppyMutation } from './useUpdatePuppyMutation';
import { useDeletePuppyMutation } from './useDeletePuppyMutation';
import { toast } from '@/components/ui/use-toast';

export const usePuppyQueries = (litterId: string) => {
  // Use the separated mutation hooks
  const addPuppyMutation = useAddPuppyMutation(litterId);
  const updatePuppyMutation = useUpdatePuppyMutation(litterId);
  const deletePuppyMutation = useDeletePuppyMutation(litterId);

  // Helper function for adding a puppy with proper error handling
  const addPuppy = useCallback(async (puppy: Puppy) => {
    try {
      await addPuppyMutation.mutateAsync(puppy);
      toast({
        title: "Puppy Added",
        description: `${puppy.name} has been added to the litter.`
      });
      return true;
    } catch (error) {
      console.error('Error adding puppy:', error);
      return false;
    }
  }, [addPuppyMutation]);

  // Helper function for updating a puppy with proper error handling
  const updatePuppy = useCallback(async (puppy: Puppy) => {
    try {
      await updatePuppyMutation.mutateAsync(puppy);
      return true;
    } catch (error) {
      console.error('Error updating puppy:', error);
      return false;
    }
  }, [updatePuppyMutation]);

  // Helper function for deleting a puppy with proper error handling
  const deletePuppy = useCallback(async (puppyId: string) => {
    try {
      await deletePuppyMutation.mutateAsync(puppyId);
      return true;
    } catch (error) {
      console.error('Error deleting puppy:', error);
      return false;
    }
  }, [deletePuppyMutation]);

  return {
    addPuppy,
    updatePuppy,
    deletePuppy,
    isAdding: addPuppyMutation.isPending,
    isUpdating: updatePuppyMutation.isPending,
    isDeleting: deletePuppyMutation.isPending
  };
};

export default usePuppyQueries;
