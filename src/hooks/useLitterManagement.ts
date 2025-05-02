import { useState, useEffect, useCallback } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLittersService } from '@/services/planned-litters/plannedLittersService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useLitterManagement() {
  // Add useAuth to get the current user
  const { user } = useAuth();
  
  // State for litters data
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [plannedLitters, setPlannedLitters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  
  // Load litters function - extracted for reusability
  const loadLittersData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading litters data...");
      const active = await litterService.getActiveLitters();
      const archived = await litterService.getArchivedLitters();
      
      // Sort litters by date (newest first)
      const sortByDate = (a: Litter, b: Litter) => 
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      
      const sortedActive = active.sort(sortByDate);
      const sortedArchived = archived.sort(sortByDate);
      
      console.log("Loaded active litters:", sortedActive);
      console.log("Loaded archived litters:", sortedArchived);
      
      setActiveLitters(sortedActive);
      setArchivedLitters(sortedArchived);
      
      // Select the newest active litter by default
      if (sortedActive.length > 0 && !selectedLitterId) {
        setSelectedLitterId(sortedActive[0].id);
      } else if (sortedActive.length === 0 && sortedArchived.length > 0 && !selectedLitterId) {
        setSelectedLitterId(sortedArchived[0].id);
      }
    } catch (error) {
      console.error('Error loading litters:', error);
      toast({
        title: "Error Loading Litters",
        description: "Failed to load your litters. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedLitterId]);
  
  // Initial data load
  useEffect(() => {
    loadLittersData();
    
    // Load planned litters properly handling the async function
    const loadPlannedLitters = async () => {
      try {
        const loadedPlannedLitters = await plannedLittersService.loadPlannedLitters();
        setPlannedLitters(loadedPlannedLitters);
      } catch (error) {
        console.error('Error loading planned litters:', error);
      }
    };
    
    loadPlannedLitters();
    
    // Subscribe to changes in the litters table
    const channel = supabase
      .channel('litters-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'litters' },
        (payload) => {
          console.log('Litter change detected:', payload);
          // Reload litters when changes are detected
          loadLittersData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLittersData]);
  
  // Handlers for litter operations
  const handleAddLitter = async (newLitter: Litter) => {
    newLitter.puppies = [];
    newLitter.archived = false;
    
    // Verify user session
    const { data: sessionData } = await supabase.auth.getSession();
    
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
      await litterService.addLitter(newLitter);
      
      // Immediately reload litters to refresh the UI
      await loadLittersData();
      
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
        description: "Failed to add litter. Please try again.",
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
  
  async function addPuppy(newPuppy: Puppy) {
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
  
  async function updatePuppy(updatedPuppy: Puppy) {
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

  async function deletePuppy(puppyId: string) {
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
        if (selectedLitterId === litterId) {
          if (activeLitters.length > 0) {
            setSelectedLitterId(activeLitters[0].id);
          } else if (archivedLitters.length > 0) {
            setSelectedLitterId(archivedLitters[0].id);
          } else {
            setSelectedLitterId(null);
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
  
  // Get available years for filtering
  function getAvailableYears() {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  }

  // Find the currently selected litter
  const selectedLitter = selectedLitterId 
    ? [...activeLitters, ...archivedLitters].find(litter => litter.id === selectedLitterId) 
    : null;
  
  // Handle selecting a litter
  const handleSelectLitter = (litter: Litter) => {
    setSelectedLitterId(litter.id);
  };

  return {
    activeLitters,
    archivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    plannedLitters,
    showAddLitterDialog,
    setShowAddLitterDialog,
    selectedLitter,
    isLoading,
    handleAddLitter,
    handleUpdateLitter: updateLitter,
    handleAddPuppy: addPuppy,
    handleUpdatePuppy: updatePuppy,
    handleDeletePuppy: deletePuppy,
    handleDeleteLitter: deleteLitter,
    handleArchiveLitter: archiveLitter,
    handleSelectLitter,
    getAvailableYears
  };
}
