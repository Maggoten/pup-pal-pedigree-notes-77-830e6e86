
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { Puppy, Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';

export const usePuppyQueries = (litterId: string) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get litter data with puppies
  const { data: litter, error, isPending } = useQuery({
    queryKey: ['litter', litterId],
    queryFn: () => litterService.getLitterDetails(litterId),
    enabled: !!litterId,
  });

  // Mutation to update a puppy
  const updatePuppyMutation = useMutation({
    mutationFn: (puppy: Puppy) => {
      // Log the puppy object being updated for debugging
      console.log(`Updating puppy ${puppy.name} (${puppy.id}) with weightLog:`, 
        puppy.weightLog ? puppy.weightLog.length : 'undefined');
      
      return litterService.updatePuppy(litterId, puppy);
    },
    onSuccess: (updatedLitters: Litter[]) => {
      console.log("Puppy update successful, invalidating queries");
      // Update the cache for the specific litter
      queryClient.invalidateQueries({queryKey: ['litter', litterId]});
      // Also invalidate the overall litters list
      queryClient.invalidateQueries({queryKey: ['litters']});
      
      toast({
        title: "Puppy Updated",
        description: "The puppy has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating puppy:", error);
      toast({
        title: "Update Failed",
        description: `Error updating puppy: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Mutation to delete a puppy
  const deletePuppyMutation = useMutation({
    mutationFn: (puppyId: string) => litterService.deletePuppy(litterId, puppyId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['litter', litterId]});
      queryClient.invalidateQueries({queryKey: ['litters']});
      
      toast({
        title: "Puppy Deleted",
        description: "The puppy has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting puppy:", error);
      toast({
        title: "Delete Failed",
        description: `Error deleting puppy: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Function to update a puppy
  const updatePuppy = async (puppy: Puppy) => {
    setIsLoading(true);
    try {
      await updatePuppyMutation.mutateAsync(puppy);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a puppy
  const deletePuppy = async (puppyId: string) => {
    setIsLoading(true);
    try {
      await deletePuppyMutation.mutateAsync(puppyId);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    litter,
    error,
    isLoading: isPending || isLoading,
    updatePuppy,
    deletePuppy
  };
};

export default usePuppyQueries;
