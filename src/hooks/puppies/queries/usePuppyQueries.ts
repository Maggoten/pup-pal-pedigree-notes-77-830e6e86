
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { Puppy, Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';

export const usePuppyQueries = (litterId: string) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get litter data with puppies
  const { data: litter, error, isPending, refetch } = useQuery({
    queryKey: ['litter', litterId],
    queryFn: () => {
      console.log(`usePuppyQueries: Fetching litter details for ${litterId}`);
      return litterService.getLitterDetails(litterId);
    },
    enabled: !!litterId,
    staleTime: 0, // Always consider data stale to ensure fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  // Add logging to track when litter data changes
  useState(() => {
    if (litter) {
      console.log(`usePuppyQueries: Litter data updated for ${litter.name}:`, {
        puppiesCount: litter.puppies?.length || 0,
        puppies: litter.puppies?.map(p => ({
          id: p.id,
          name: p.name,
          notesCount: p.notes?.length || 0
        })) || []
      });
    }
  });

  // Mutation to update a puppy
  const updatePuppyMutation = useMutation({
    mutationFn: (puppy: Puppy) => {
      console.log(`usePuppyQueries: Updating puppy ${puppy.name} (${puppy.id}):`);
      console.log(`Weight log entries: ${puppy.weightLog?.length || 0}`);
      console.log(`Notes entries: ${puppy.notes?.length || 0}`);
      console.log(`Current weight: ${puppy.currentWeight}`);
      
      if (puppy.weightLog && puppy.weightLog.length > 0) {
        const latestWeight = [...puppy.weightLog]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        console.log(`Latest weight log entry: ${latestWeight.weight} kg from ${latestWeight.date}`);
      }
      
      if (puppy.notes && puppy.notes.length > 0) {
        console.log(`Notes for ${puppy.name}:`, puppy.notes.map(n => ({
          date: n.date,
          content: n.content.substring(0, 50) + '...'
        })));
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
    onSuccess: async () => {
      console.log("usePuppyQueries: Puppy update successful, invalidating and refetching queries");
      
      // Invalidate all related queries
      await queryClient.invalidateQueries({queryKey: ['litter']});
      await queryClient.invalidateQueries({queryKey: ['litter', litterId]});
      await queryClient.invalidateQueries({queryKey: ['litters']});
      
      // Force an immediate refetch of the current litter data
      console.log("usePuppyQueries: Forcing refetch of litter data");
      const refetchResult = await refetch();
      
      if (refetchResult.data) {
        console.log("usePuppyQueries: Refetch successful, updated litter data:", {
          puppiesCount: refetchResult.data.puppies?.length || 0,
          puppies: refetchResult.data.puppies?.map(p => ({
            id: p.id,
            name: p.name,
            notesCount: p.notes?.length || 0
          })) || []
        });
      } else {
        console.error("usePuppyQueries: Refetch failed or returned no data");
      }
      
      toast({
        title: "Puppy Updated",
        description: "The puppy has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("usePuppyQueries: Error updating puppy:", error);
      toast({
        title: "Update Failed",
        description: `Error updating puppy: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Mutation to delete a puppy
  const deletePuppyMutation = useMutation({
    mutationFn: (puppyId: string) => {
      console.log(`usePuppyQueries: Deleting puppy ${puppyId}`);
      return litterService.deletePuppy(puppyId);
    },
    onSuccess: async () => {
      console.log("usePuppyQueries: Puppy delete successful, invalidating and refetching queries");
      
      await queryClient.invalidateQueries({queryKey: ['litter', litterId]});
      await queryClient.invalidateQueries({queryKey: ['litters']});
      
      // Force refetch after deletion
      await refetch();
      
      toast({
        title: "Puppy Deleted",
        description: "The puppy has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error("usePuppyQueries: Error deleting puppy:", error);
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
      console.log(`usePuppyQueries: Preparing to update puppy ${puppy.name} (${puppy.id})`);
      console.log(`Current weight value: ${puppy.currentWeight}`);
      console.log(`Notes count: ${puppy.notes?.length || 0}`);
      
      // Create a deep clone to avoid any reference issues
      const puppyToUpdate = {
        ...puppy,
        weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
        heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
        notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
      };
      
      console.log(`usePuppyQueries: Sending update for puppy with ${puppyToUpdate.weightLog?.length || 0} weight records and ${puppyToUpdate.notes?.length || 0} notes`);
      
      // Update the currentWeight field based on the latest weight log entry if not already set
      if (puppyToUpdate.weightLog && puppyToUpdate.weightLog.length > 0 && !puppyToUpdate.currentWeight) {
        const sortedWeightLog = [...puppyToUpdate.weightLog]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (sortedWeightLog.length > 0) {
          puppyToUpdate.currentWeight = sortedWeightLog[0].weight;
          console.log(`usePuppyQueries: Automatically setting currentWeight to latest log value: ${puppyToUpdate.currentWeight}`);
        }
      }
      
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

  // Function to manually refresh the litter data
  const refreshLitterData = async () => {
    console.log("usePuppyQueries: Manual refresh requested");
    try {
      await queryClient.invalidateQueries({queryKey: ['litter', litterId]});
      const result = await refetch();
      console.log("usePuppyQueries: Manual refresh completed successfully");
      return result.data;
    } catch (error) {
      console.error("usePuppyQueries: Manual refresh failed:", error);
      throw error;
    }
  };

  return {
    litter,
    error,
    isLoading: isPending || isLoading,
    updatePuppy,
    deletePuppy,
    refreshLitterData
  };
};

export default usePuppyQueries;
