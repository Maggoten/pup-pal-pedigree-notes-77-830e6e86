
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseLitterService } from '@/services/supabase/litterService';
import { Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterQueryKeys } from './queryKeys';

export function usePuppyMutations() {
  const queryClient = useQueryClient();

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
    // Functions with clearer parameter requirements
    addPuppy: (litterId: string, puppy: Puppy) => {
      addPuppyMutation.mutate({ litterId, puppy });
    },
    
    updatePuppy: (litterId: string, puppy: Puppy) => {
      updatePuppyMutation.mutate({ litterId, puppy });
    },
    
    deletePuppy: (puppyId: string) => deletePuppyMutation.mutate(puppyId),
  };
}
