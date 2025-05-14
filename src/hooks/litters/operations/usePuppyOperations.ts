
import { litterService } from '@/services/LitterService';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export function usePuppyOperations(
  loadLittersData
) {
  const { isAuthReady } = useAuth();
  const queryClient = useQueryClient();
  
  async function addPuppy(selectedLitterId: string | null, newPuppy: Puppy) {
    if (!selectedLitterId) return;
    
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[PuppyOps] Auth not ready yet, delaying puppy addition');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
    try {
      const result = await litterService.addPuppy(selectedLitterId, newPuppy);
      
      // Update React Query cache immediately
      const litterQueryKey = ['litters', selectedLitterId];
      queryClient.invalidateQueries({ queryKey: litterQueryKey });
      
      // Also reload the full data
      await loadLittersData();
      
      toast({
        title: "Puppy Added",
        description: `${newPuppy.name} has been added to the litter.`
      });
      
      return result;
    } catch (error) {
      console.error('Error adding puppy:', error);
      toast({
        title: "Error",
        description: "Failed to add puppy. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  async function updatePuppy(selectedLitterId: string | null, updatedPuppy: Puppy) {
    if (!selectedLitterId) return;
    
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[PuppyOps] Auth not ready yet, delaying puppy update');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
    try {
      const result = await litterService.updatePuppy(selectedLitterId, updatedPuppy);
      
      // Update React Query cache immediately
      const litterQueryKey = ['litters', selectedLitterId];
      queryClient.invalidateQueries({ queryKey: litterQueryKey });
      
      // Also reload the full data
      await loadLittersData();
      
      return result;
    } catch (error) {
      console.error('Error updating puppy:', error);
      toast({
        title: "Error",
        description: "Failed to update puppy. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function deletePuppy(selectedLitterId: string | null, puppyId: string) {
    if (!selectedLitterId) return;
    
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[PuppyOps] Auth not ready yet, delaying puppy deletion');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
    try {
      const result = await litterService.deletePuppy(selectedLitterId, puppyId);
      
      // Update React Query cache immediately
      const litterQueryKey = ['litters', selectedLitterId];
      queryClient.invalidateQueries({ queryKey: litterQueryKey });
      
      // Also reload the full data
      await loadLittersData();
      
      toast({
        title: "Puppy Deleted",
        description: "The puppy has been removed from the litter."
      });
      
      return result;
    } catch (error) {
      console.error('Error deleting puppy:', error);
      toast({
        title: "Error",
        description: "Failed to delete puppy. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }

  return {
    addPuppy,
    updatePuppy,
    deletePuppy
  };
}
