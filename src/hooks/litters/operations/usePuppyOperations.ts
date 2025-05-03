
import { litterService } from '@/services/LitterService';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';

export function usePuppyOperations(
  loadLittersData
) {
  async function addPuppy(selectedLitterId: string | null, newPuppy: Puppy) {
    if (!selectedLitterId) return;
    
    try {
      await litterService.addPuppy(selectedLitterId, newPuppy);
      await loadLittersData();
      
      toast({
        title: "Puppy Added",
        description: `${newPuppy.name} has been added to the litter.`
      });
    } catch (error) {
      console.error('Error adding puppy:', error);
      toast({
        title: "Error",
        description: "Failed to add puppy. Please try again.",
        variant: "destructive"
      });
    }
  }
  
  async function updatePuppy(selectedLitterId: string | null, updatedPuppy: Puppy) {
    if (!selectedLitterId) return;
    
    try {
      await litterService.updatePuppy(selectedLitterId, updatedPuppy);
      await loadLittersData();
    } catch (error) {
      console.error('Error updating puppy:', error);
      toast({
        title: "Error",
        description: "Failed to update puppy. Please try again.",
        variant: "destructive"
      });
    }
  }

  async function deletePuppy(selectedLitterId: string | null, puppyId: string) {
    if (!selectedLitterId) return;
    
    try {
      await litterService.deletePuppy(selectedLitterId, puppyId);
      await loadLittersData();
    } catch (error) {
      console.error('Error deleting puppy:', error);
      toast({
        title: "Error",
        description: "Failed to delete puppy. Please try again.",
        variant: "destructive"
      });
    }
  }

  return {
    addPuppy,
    updatePuppy,
    deletePuppy
  };
}
