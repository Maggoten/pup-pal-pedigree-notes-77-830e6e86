
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
      console.log(`Updating puppy ${puppy.name} (${puppy.id}):`);
      console.log(`Weight log entries: ${puppy.weightLog?.length || 0}`);
      
      if (puppy.weightLog && puppy.weightLog.length > 0) {
        console.log(`Latest weight: ${puppy.weightLog[puppy.weightLog.length - 1].weight} kg`);
        console.log(`Weight log details: ${JSON.stringify(puppy.weightLog)}`);
      }
      
      // Create a deep clone of the puppy data to avoid reference issues
      const puppyToUpdate = {
        ...puppy,
        weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
        heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
        notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
      };
      
      return litterService.updatePuppy(litterId, puppyToUpdate);
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
      // Ensure we're sending a clean copy of the puppy object
      console.log(`Preparing to update puppy ${puppy.name} (${puppy.id})`);
      
      // Create a deep clone to avoid any reference issues
      const puppyToUpdate = {
        ...puppy,
        weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
        heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
        notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
      };
      
      console.log(`Sending update for puppy with ${puppyToUpdate.weightLog.length} weight records`);
      
      await updatePuppyMutation.mutateAsync(puppyToUpdate);
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
