
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';
import { supabase } from '@/integrations/supabase/client';

export const useUpdatePuppyMutation = (litterId: string) => {
  const queryClient = useQueryClient();
  
  // Query keys for caching
  const puppiesQueryKey = ['litters', litterId, 'puppies'];
  const litterQueryKey = ['litters', litterId];
  const littersQueryKey = ['litters'];
  
  return useMutation({
    mutationFn: async (puppy: Puppy) => {
      console.log(`Updating puppy ${puppy.id} with weight logs:`, puppy.weightLog);
      
      try {
        // First verify we have a session to prevent auth errors
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          throw new Error("No active session found");
        }
        
        // Proceed with the update
        return await litterService.updatePuppy(litterId, puppy);
      } catch (error) {
        console.error("Error in updatePuppy mutation:", error);
        throw error;
      }
    },
    onMutate: async (updatedPuppy) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: puppiesQueryKey });
      await queryClient.cancelQueries({ queryKey: litterQueryKey });
      
      // Get snapshot of current data
      const previousLitters = queryClient.getQueryData(littersQueryKey);
      const previousLitter = queryClient.getQueryData<any>(litterQueryKey);
      
      if (previousLitter) {
        // Create a new array with the updated puppy
        const updatedPuppies = previousLitter.puppies.map((p: Puppy) => 
          p.id === updatedPuppy.id ? updatedPuppy : p
        );
        
        // Update the cache with the new data
        queryClient.setQueryData(litterQueryKey, {
          ...previousLitter,
          puppies: updatedPuppies
        });
        
        // Also update the puppy in the litters list cache if it exists
        if (queryClient.getQueryData(littersQueryKey)) {
          const litters = queryClient.getQueryData<any[]>(littersQueryKey);
          if (litters) {
            const updatedLitters = litters.map(litter => {
              if (litter.id === litterId) {
                return {
                  ...litter,
                  puppies: litter.puppies?.map((p: Puppy) => 
                    p.id === updatedPuppy.id ? updatedPuppy : p
                  ) || []
                };
              }
              return litter;
            });
            
            queryClient.setQueryData(littersQueryKey, updatedLitters);
          }
        }
      }
      
      return { previousLitters, previousLitter };
    },
    onError: (error, _, context) => {
      // Restore previous data on error
      if (context?.previousLitter) {
        queryClient.setQueryData(litterQueryKey, context.previousLitter);
      }
      if (context?.previousLitters) {
        queryClient.setQueryData(littersQueryKey, context.previousLitters);
      }
      
      toast({
        title: "Error Updating Puppy",
        description: error instanceof Error ? error.message : 'Failed to update puppy',
        variant: 'destructive'
      });
    },
    onSuccess: (_, updatedPuppy) => {
      toast({
        title: "Puppy Updated",
        description: `${updatedPuppy.name}'s data has been updated successfully.`,
        variant: 'default'
      });
    },
    onSettled: () => {
      // Always invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: puppiesQueryKey });
      queryClient.invalidateQueries({ queryKey: litterQueryKey });
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
    }
  });
};
