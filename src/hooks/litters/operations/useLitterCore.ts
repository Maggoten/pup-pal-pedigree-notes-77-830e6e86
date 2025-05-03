
import { litterService } from '@/services/LitterService';
import { toast } from '@/components/ui/use-toast';
import { Litter } from '@/types/breeding';

export function useLitterCore(
  loadLittersData,
  setActiveLitters,
  setArchivedLitters,
  setSelectedLitterId,
  activeLitters,
  archivedLitters
) {
  // Handlers for basic litter operations
  async function deleteLitter(litterId: string) {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      try {
        await litterService.deleteLitter(litterId);
        await loadLittersData();
        
        toast({
          title: "Litter Deleted",
          description: "The litter has been deleted successfully.",
          variant: "destructive"
        });
      } catch (error) {
        console.error('Error deleting litter:', error);
        toast({
          title: "Error",
          description: "Failed to delete litter. Please try again.",
          variant: "destructive"
        });
      }
    }
  }
  
  async function archiveLitter(litterId: string, archive: boolean) {
    try {
      await litterService.toggleArchiveLitter(litterId, archive);
      await loadLittersData();
      
      toast({
        title: archive ? "Litter Archived" : "Litter Activated",
        description: archive 
          ? "The litter has been moved to the archive." 
          : "The litter has been moved to active litters."
      });
    } catch (error) {
      console.error('Error archiving litter:', error);
      toast({
        title: "Error",
        description: "Failed to archive litter. Please try again.",
        variant: "destructive"
      });
    }
  }

  async function updateLitter(updatedLitter: Litter) {
    try {
      await litterService.updateLitter(updatedLitter);
      await loadLittersData();
      
      toast({
        title: "Litter Updated",
        description: `${updatedLitter.name} has been updated successfully.`
      });
    } catch (error) {
      console.error('Error updating litter:', error);
      toast({
        title: "Error",
        description: "Failed to update litter. Please try again.",
        variant: "destructive"
      });
    }
  }
  
  return {
    updateLitter,
    deleteLitter,
    archiveLitter
  };
}
