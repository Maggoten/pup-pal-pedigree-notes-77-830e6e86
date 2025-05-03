
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';

// This hook centralizes all litter-related queries and mutations
export const useLitterQueries = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Query keys for caching
  const littersQueryKey = ['litters'];
  const activeLittersKey = ['litters', 'active'];
  const archivedLittersKey = ['litters', 'archived'];
  
  // Query for loading active litters with automatic caching
  const activeLittersQuery = useQuery({
    queryKey: activeLittersKey,
    queryFn: () => litterService.getActiveLitters(),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Query for archived litters
  const archivedLittersQuery = useQuery({
    queryKey: archivedLittersKey,
    queryFn: () => litterService.getArchivedLitters(),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Helper function to determine if we have valid data
  const isDataReady = useCallback(() => {
    return activeLittersQuery.isSuccess && archivedLittersQuery.isSuccess;
  }, [activeLittersQuery.isSuccess, archivedLittersQuery.isSuccess]);
  
  // Mutation for adding a new litter
  const addLitterMutation = useMutation({
    mutationFn: (litter: Litter) => litterService.addLitter(litter),
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Litter",
        description: error instanceof Error ? error.message : "Failed to add litter.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for updating a litter
  const updateLitterMutation = useMutation({
    mutationFn: (litter: Litter) => litterService.updateLitter(litter),
    onMutate: async (updatedLitter) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: littersQueryKey });
      
      // Get snapshot of current data
      const previousActiveLitters = queryClient.getQueryData(activeLittersKey) as Litter[] | undefined;
      const previousArchivedLitters = queryClient.getQueryData(archivedLittersKey) as Litter[] | undefined;
      
      // Optimistically update the cache
      if (updatedLitter.archived && previousArchivedLitters) {
        const newArchivedLitters = [...previousArchivedLitters];
        const existingIndex = newArchivedLitters.findIndex(l => l.id === updatedLitter.id);
        
        if (existingIndex !== -1) {
          newArchivedLitters[existingIndex] = updatedLitter;
        } else {
          newArchivedLitters.push(updatedLitter);
        }
        
        queryClient.setQueryData(archivedLittersKey, newArchivedLitters);
      } else if (!updatedLitter.archived && previousActiveLitters) {
        const newActiveLitters = [...previousActiveLitters];
        const existingIndex = newActiveLitters.findIndex(l => l.id === updatedLitter.id);
        
        if (existingIndex !== -1) {
          newActiveLitters[existingIndex] = updatedLitter;
        } else {
          newActiveLitters.push(updatedLitter);
        }
        
        queryClient.setQueryData(activeLittersKey, newActiveLitters);
      }
      
      return { previousActiveLitters, previousArchivedLitters };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousActiveLitters) {
        queryClient.setQueryData(activeLittersKey, context.previousActiveLitters);
      }
      if (context?.previousArchivedLitters) {
        queryClient.setQueryData(archivedLittersKey, context.previousArchivedLitters);
      }
      
      toast({
        title: "Error Updating Litter",
        description: error instanceof Error ? error.message : "Failed to update litter.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting a litter
  const deleteLitterMutation = useMutation({
    mutationFn: (litterId: string) => litterService.deleteLitter(litterId),
    onMutate: async (litterId) => {
      await queryClient.cancelQueries({ queryKey: littersQueryKey });
      
      // Get snapshot of current data
      const previousActiveLitters = queryClient.getQueryData(activeLittersKey) as Litter[] | undefined;
      const previousArchivedLitters = queryClient.getQueryData(archivedLittersKey) as Litter[] | undefined;
      
      // Optimistically update the cache
      if (previousActiveLitters) {
        queryClient.setQueryData(
          activeLittersKey, 
          previousActiveLitters.filter(litter => litter.id !== litterId)
        );
      }
      
      if (previousArchivedLitters) {
        queryClient.setQueryData(
          archivedLittersKey, 
          previousArchivedLitters.filter(litter => litter.id !== litterId)
        );
      }
      
      return { previousActiveLitters, previousArchivedLitters };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      toast({
        title: "Litter Deleted",
        description: "The litter has been deleted successfully.",
        variant: "destructive"
      });
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousActiveLitters) {
        queryClient.setQueryData(activeLittersKey, context.previousActiveLitters);
      }
      if (context?.previousArchivedLitters) {
        queryClient.setQueryData(archivedLittersKey, context.previousArchivedLitters);
      }
      
      toast({
        title: "Error Deleting Litter",
        description: error instanceof Error ? error.message : "Failed to delete litter.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for archiving/unarchiving a litter
  const archiveLitterMutation = useMutation({
    mutationFn: ({ litterId, archive }: { litterId: string; archive: boolean }) => 
      litterService.toggleArchiveLitter(litterId, archive),
    onMutate: async ({ litterId, archive }) => {
      await queryClient.cancelQueries({ queryKey: littersQueryKey });
      
      const previousActiveLitters = queryClient.getQueryData(activeLittersKey) as Litter[] | undefined;
      const previousArchivedLitters = queryClient.getQueryData(archivedLittersKey) as Litter[] | undefined;
      
      // Find the litter in the appropriate list
      const sourceLitters = archive ? previousActiveLitters : previousArchivedLitters;
      const targetLitters = archive ? previousArchivedLitters : previousActiveLitters;
      
      if (!sourceLitters || !targetLitters) return { previousActiveLitters, previousArchivedLitters };
      
      const litterIndex = sourceLitters.findIndex(l => l.id === litterId);
      if (litterIndex === -1) return { previousActiveLitters, previousArchivedLitters };
      
      // Clone and modify the litter
      const litter = { ...sourceLitters[litterIndex], archived: archive };
      
      // Update both caches
      queryClient.setQueryData(
        archive ? activeLittersKey : archivedLittersKey,
        sourceLitters.filter(l => l.id !== litterId)
      );
      
      queryClient.setQueryData(
        archive ? archivedLittersKey : activeLittersKey,
        [...targetLitters, litter]
      );
      
      return { previousActiveLitters, previousArchivedLitters };
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      toast({
        title: archive ? "Litter Archived" : "Litter Activated",
        description: archive 
          ? "The litter has been moved to the archive." 
          : "The litter has been moved to active litters."
      });
    },
    onError: (error, _, context) => {
      if (context?.previousActiveLitters) {
        queryClient.setQueryData(activeLittersKey, context.previousActiveLitters);
      }
      if (context?.previousArchivedLitters) {
        queryClient.setQueryData(archivedLittersKey, context.previousArchivedLitters);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change litter status.",
        variant: "destructive"
      });
    }
  });
  
  // Helper function that determines available filter years
  const getAvailableYears = useCallback(() => {
    const yearsSet = new Set<number>();
    
    const activeLitters = activeLittersQuery.data || [];
    const archivedLitters = archivedLittersQuery.data || [];
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  }, [activeLittersQuery.data, archivedLittersQuery.data]);

  // Export an object with all the queries and mutations
  return {
    activeLitters: activeLittersQuery.data || [],
    archivedLitters: archivedLittersQuery.data || [],
    isLoading: activeLittersQuery.isLoading || archivedLittersQuery.isLoading,
    isError: activeLittersQuery.isError || archivedLittersQuery.isError,
    error: activeLittersQuery.error || archivedLittersQuery.error,
    
    addLitter: addLitterMutation.mutate,
    updateLitter: updateLitterMutation.mutate,
    deleteLitter: deleteLitterMutation.mutate,
    archiveLitter: (litterId: string, archive: boolean) => 
      archiveLitterMutation.mutate({ litterId, archive }),
    
    isAddingLitter: addLitterMutation.isPending,
    isUpdatingLitter: updateLitterMutation.isPending,
    isDeletingLitter: deleteLitterMutation.isPending,
    isArchivingLitter: archiveLitterMutation.isPending,
    
    getAvailableYears,
    isDataReady
  };
};

export default useLitterQueries;
