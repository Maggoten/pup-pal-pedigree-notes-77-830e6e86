
import { litterService } from '@/services/LitterService';
import { toast } from '@/components/ui/use-toast';
import { Litter, Puppy } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';

export function useLitterOperations(
  loadLittersData,
  setActiveLitters,
  setArchivedLitters,
  setSelectedLitterId,
  activeLitters,
  archivedLitters
) {
  // Handlers for litter operations
  const handleAddLitter = async (newLitter: Litter) => {
    newLitter.puppies = [];
    newLitter.archived = false;
    
    // Verify user session
    const { data: sessionData } = await supabase.auth.getSession();
    
    console.log("Adding litter with session:", sessionData?.session ? {
      id: sessionData.session.user.id,
      email: sessionData.session.user.email
    } : "No active session");
    
    if (!sessionData.session || !sessionData.session.user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to add a litter.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure user_id is set correctly
    newLitter.user_id = sessionData.session.user.id;
    
    try {
      console.log("Adding new litter with user ID:", newLitter.user_id);
      const updatedLitters = await litterService.addLitter(newLitter);
      
      // Update the UI with the returned data
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      console.log("Updated active litters:", active);
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      // Set the newly created litter as selected
      setSelectedLitterId(newLitter.id);
      
      toast({
        title: "Litter Added",
        description: `${newLitter.name} has been added successfully.`
      });
    } catch (error) {
      console.error('Error adding litter:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add litter. Please try again.",
        variant: "destructive"
      });
    }
  };
  
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

  async function deleteLitter(litterId: string) {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      try {
        await litterService.deleteLitter(litterId);
        await loadLittersData();
        
        // Select new litter if the deleted one was selected
        if (setSelectedLitterId && activeLitters && archivedLitters) {
          if (litterId === selectedLitterId) {
            if (activeLitters.length > 0) {
              setSelectedLitterId(activeLitters[0].id);
            } else if (archivedLitters.length > 0) {
              setSelectedLitterId(archivedLitters[0].id);
            } else {
              setSelectedLitterId(null);
            }
          }
        }
        
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

  return {
    handleAddLitter,
    updateLitter,
    addPuppy,
    updatePuppy,
    deletePuppy,
    deleteLitter,
    archiveLitter
  };
}
