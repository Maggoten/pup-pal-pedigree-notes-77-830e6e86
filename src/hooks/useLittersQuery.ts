
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseLitterService } from '@/services/supabase/litterService';
import { Litter, Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// Define query keys for better caching and invalidation
export const litterQueryKeys = {
  all: ['litters'] as const,
  lists: () => [...litterQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...litterQueryKeys.lists(), { filters }] as const,
  details: (id: string) => [...litterQueryKeys.all, 'detail', id] as const,
  puppies: (litterId: string) => [...litterQueryKeys.all, 'puppies', litterId] as const,
};

export function useLittersQuery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Main query for fetching litter data
  const {
    data: litters = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: litterQueryKeys.lists(),
    queryFn: async () => {
      if (!user) return [];
      
      const litters = await supabaseLitterService.loadLitters();
      // Pre-sort litters here to avoid re-sorting on render
      const sortByDate = (a: Litter, b: Litter) => 
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      
      return litters.sort(sortByDate);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Separate active and archived litters to avoid recalculations
  const activeLitters = litters?.filter(litter => !litter.archived) || [];
  const archivedLitters = litters?.filter(litter => litter.archived) || [];
  
  // Error handling for data fetching
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading litters",
        description: error instanceof Error ? error.message : "Failed to load litters data",
        variant: "destructive",
      });
    }
  }, [isError, error]);

  // Add litter mutation
  const addLitterMutation = useMutation({
    mutationFn: (newLitter: Litter) => supabaseLitterService.addLitter(newLitter),
    onSuccess: (result) => {
      if (result) {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: litterQueryKeys.lists() });
        toast({
          title: "Litter Added",
          description: `The litter has been added successfully.`
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add litter",
        variant: "destructive"
      });
    }
  });

  // Update litter mutation
  const updateLitterMutation = useMutation({
    mutationFn: (updatedLitter: Litter) => supabaseLitterService.updateLitter(updatedLitter),
    onSuccess: (result, variables) => {
      if (result) {
        // Update cache optimistically
        queryClient.setQueriesData({ queryKey: litterQueryKeys.lists() }, (oldData: Litter[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(litter => 
            litter.id === variables.id ? variables : litter
          );
        });
        
        // Invalidate for a background refresh
        queryClient.invalidateQueries({ queryKey: litterQueryKeys.lists() });
        
        toast({
          title: "Litter Updated",
          description: `The litter has been updated successfully.`
        });
      }
    }
  });

  // Delete litter mutation
  const deleteLitterMutation = useMutation({
    mutationFn: (litterId: string) => supabaseLitterService.deleteLitter(litterId),
    onSuccess: (result, variables) => {
      if (result) {
        // Update cache optimistically
        queryClient.setQueriesData({ queryKey: litterQueryKeys.lists() }, (oldData: Litter[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(litter => litter.id !== variables);
        });
        
        // Then invalidate for a background refresh
        queryClient.invalidateQueries({ queryKey: litterQueryKeys.lists() });
        
        toast({
          title: "Litter Deleted",
          description: "The litter has been deleted successfully."
        });
      }
    }
  });

  // Archive/unarchive litter mutation
  const archiveLitterMutation = useMutation({
    mutationFn: ({ litterId, archive }: { litterId: string; archive: boolean }) => 
      supabaseLitterService.toggleArchiveLitter(litterId, archive),
    onSuccess: (result, variables) => {
      if (result) {
        // Update cache optimistically 
        queryClient.setQueriesData({ queryKey: litterQueryKeys.lists() }, (oldData: Litter[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(litter => 
            litter.id === variables.litterId ? { ...litter, archived: variables.archive } : litter
          );
        });
        
        // Then invalidate for a background refresh
        queryClient.invalidateQueries({ queryKey: litterQueryKeys.lists() });
        
        toast({
          title: variables.archive ? "Litter Archived" : "Litter Activated",
          description: variables.archive 
            ? "The litter has been moved to the archive." 
            : "The litter has been moved to active litters."
        });
      }
    }
  });

  // Add puppy mutation
  const addPuppyMutation = useMutation({
    mutationFn: ({ litterId, puppy }: { litterId: string; puppy: Puppy }) => 
      supabaseLitterService.addPuppy(litterId, puppy),
    onSuccess: (result, variables) => {
      if (result) {
        // Invalidate and refetch the specific litter
        queryClient.invalidateQueries({ 
          queryKey: litterQueryKeys.details(variables.litterId)
        });
        
        toast({
          title: "Puppy Added",
          description: `${variables.puppy.name} has been added to the litter.`
        });
      }
    }
  });

  // Update puppy mutation
  const updatePuppyMutation = useMutation({
    mutationFn: ({ litterId, puppy }: { litterId: string; puppy: Puppy }) => 
      supabaseLitterService.updatePuppy(litterId, puppy),
    onSuccess: (result, variables) => {
      if (result) {
        // Invalidate and refetch
        queryClient.invalidateQueries({ 
          queryKey: litterQueryKeys.details(variables.litterId)
        });
        
        toast({
          title: "Puppy Updated",
          description: `${variables.puppy.name} has been updated successfully.`
        });
      }
    }
  });

  // Delete puppy mutation
  const deletePuppyMutation = useMutation({
    mutationFn: (puppyId: string) => 
      supabaseLitterService.deletePuppy(puppyId),
    onSuccess: () => {
      // Invalidate and refetch all litters since we don't know which litter the puppy belonged to
      queryClient.invalidateQueries({ queryKey: litterQueryKeys.lists() });
      
      toast({
        title: "Puppy Deleted",
        description: "The puppy has been deleted successfully."
      });
    }
  });

  return {
    litters,
    activeLitters,
    archivedLitters,
    isLoading,
    isError,
    refetch,
    
    // Mutations
    addLitter: (litter: Litter) => addLitterMutation.mutate(litter),
    updateLitter: (litter: Litter) => updateLitterMutation.mutate(litter),
    deleteLitter: (litterId: string) => deleteLitterMutation.mutate(litterId),
    archiveLitter: (litterId: string, archive: boolean) => 
      archiveLitterMutation.mutate({ litterId, archive }),
    
    // Changed the API here - Now we accept the exact parameters needed for each component
    // For components that need to add a puppy with just a puppy parameter
    addPuppy: (puppy: Puppy, litterId?: string) => {
      if (!litterId) {
        console.error("Cannot add puppy: Missing litter ID");
        return;
      }
      addPuppyMutation.mutate({ litterId, puppy });
    },
    
    // For components that need to update a puppy with just a puppy parameter
    updatePuppy: (puppy: Puppy, litterId?: string) => {
      if (!litterId) {
        console.error("Cannot update puppy: Missing litter ID");
        return;
      }
      updatePuppyMutation.mutate({ litterId, puppy });
    },
    
    deletePuppy: (puppyId: string) => deletePuppyMutation.mutate(puppyId),
    
    // Helper functions
    getAvailableYears: () => {
      const yearsSet = new Set<number>();
      
      [...activeLitters, ...archivedLitters].forEach(litter => {
        const year = new Date(litter.dateOfBirth).getFullYear();
        yearsSet.add(year);
      });
      
      return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
    }
  };
}
