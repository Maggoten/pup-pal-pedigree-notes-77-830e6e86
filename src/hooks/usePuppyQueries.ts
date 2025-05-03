
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';

export const usePuppyQueries = (litterId: string) => {
  const queryClient = useQueryClient();
  
  // Query key for caching
  const puppiesQueryKey = ['litters', litterId, 'puppies'];
  
  // Mutation for adding puppy
  const addPuppyMutation = useMutation({
    mutationFn: (puppy: Puppy) => litterService.addPuppy(litterId, puppy),
    onMutate: async (newPuppy) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      
      // Get current data
      const previousLitters = queryClient.getQueryData(['litters']);
      
      // Update the cache optimistically
      const litter = queryClient.getQueryData<any>(['litters', litterId]);
      if (litter) {
        queryClient.setQueryData(['litters', litterId], {
          ...litter,
          puppies: [...(litter.puppies || []), newPuppy]
        });
      }
      
      return { previousLitters };
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      toast({
        title: 'Error Adding Puppy',
        description: error instanceof Error ? error.message : 'Failed to add puppy',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });
  
  // Mutation for updating puppy
  const updatePuppyMutation = useMutation({
    mutationFn: (puppy: Puppy) => litterService.updatePuppy(litterId, puppy),
    onMutate: async (updatedPuppy) => {
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      
      const previousLitters = queryClient.getQueryData(['litters']);
      
      const litter = queryClient.getQueryData<any>(['litters', litterId]);
      if (litter) {
        const updatedPuppies = litter.puppies.map((p: Puppy) => 
          p.id === updatedPuppy.id ? updatedPuppy : p
        );
        
        queryClient.setQueryData(['litters', litterId], {
          ...litter,
          puppies: updatedPuppies
        });
      }
      
      return { previousLitters };
    },
    onError: (error, _, context) => {
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      toast({
        title: 'Error Updating Puppy',
        description: error instanceof Error ? error.message : 'Failed to update puppy',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });
  
  // Mutation for deleting puppy
  const deletePuppyMutation = useMutation({
    mutationFn: (puppyId: string) => litterService.deletePuppy(litterId, puppyId),
    onMutate: async (puppyId) => {
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      
      const previousLitters = queryClient.getQueryData(['litters']);
      
      const litter = queryClient.getQueryData<any>(['litters', litterId]);
      if (litter) {
        queryClient.setQueryData(['litters', litterId], {
          ...litter,
          puppies: litter.puppies.filter((p: Puppy) => p.id !== puppyId)
        });
      }
      
      return { previousLitters };
    },
    onError: (error, _, context) => {
      if (context?.previousLitters) {
        queryClient.setQueryData(['litters'], context.previousLitters);
      }
      toast({
        title: 'Error Deleting Puppy',
        description: error instanceof Error ? error.message : 'Failed to delete puppy',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    }
  });

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
