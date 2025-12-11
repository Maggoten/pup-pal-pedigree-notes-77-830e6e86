
import { litterService } from '@/services/LitterService';
import { toast } from '@/components/ui/use-toast';
import { Litter } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';

export function useLitterCore(
  loadLittersData,
  loadLitterDetails: (litterId: string) => Promise<void>,
  setActiveLitters,
  setArchivedLitters,
  setSelectedLitterId,
  activeLitters,
  archivedLitters
) {
  const { isAuthReady } = useAuth();
  
  // Handlers for basic litter operations
  async function deleteLitter(litterId: string) {
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[LitterOps] Auth not ready yet, delaying litter deletion');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
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
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[LitterOps] Auth not ready yet, delaying litter archiving');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
    try {
      await litterService.toggleArchiveLitter(litterId, archive);
      await loadLittersData();
      
      // Reload litter details to ensure puppies are loaded for the updated litter
      await loadLitterDetails(litterId);
      
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
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[LitterOps] Auth not ready yet, delaying litter update');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
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
