
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseLitterService } from '@/services/supabase/litterService';
import { Litter, Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterQueryKeys } from './queryKeys';

export function useLitterMutations() {
  const queryClient = useQueryClient();

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

  return {
    addLitter: (litter: Litter) => addLitterMutation.mutate(litter),
    updateLitter: (litter: Litter) => updateLitterMutation.mutate(litter),
    deleteLitter: (litterId: string) => deleteLitterMutation.mutate(litterId),
    archiveLitter: (litterId: string, archive: boolean) => 
      archiveLitterMutation.mutate({ litterId, archive }),
  };
}
