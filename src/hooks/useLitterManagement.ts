
import { useState, useEffect } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLittersService } from '@/services/planned-litters/plannedLittersService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  
  // Load litters on component mount
  useEffect(() => {
    const loadLitters = async () => {
      setIsLoading(true);
      try {
        const active = await litterService.getActiveLitters();
        const archived = await litterService.getArchivedLitters();
        
        // Sort litters by date (newest first)
        const sortByDate = (a: Litter, b: Litter) => 
          new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
        
        const sortedActive = active.sort(sortByDate);
        const sortedArchived = archived.sort(sortByDate);
        
        setActiveLitters(sortedActive);
        setArchivedLitters(sortedArchived);
        
        // Select the newest active litter by default
        if (sortedActive.length > 0 && !selectedLitterId) {
          setSelectedLitterId(sortedActive[0].id);
        } else if (sortedActive.length === 0 && sortedArchived.length > 0) {
          setSelectedLitterId(sortedArchived[0].id);
        }
      } catch (error) {
        console.error('Error loading litters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLitters();
    
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
  }, []);
  
  // Handlers for litter operations
  const handleAddLitter = async (newLitter: Litter) => {
    newLitter.puppies = [];
    newLitter.archived = false;
    
    // Ensure user_id is set correctly
    if (user) {
      newLitter.user_id = user.id;
    }
    
    try {
      const updatedLitters = await litterService.addLitter(newLitter);
      setActiveLitters(await litterService.getActiveLitters());
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
  
  const handleUpdateLitter = async (updatedLitter: Litter) => {
    try {
      await litterService.updateLitter(updatedLitter);
      setActiveLitters(await litterService.getActiveLitters());
      setArchivedLitters(await litterService.getArchivedLitters());
      
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
  };
  
  const handleAddPuppy = async (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    try {
      // Add the puppy without modifying its name
      await litterService.addPuppy(selectedLitterId, newPuppy);
      setActiveLitters(await litterService.getActiveLitters());
      setArchivedLitters(await litterService.getArchivedLitters());
      
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
  };
  
  const handleUpdatePuppy = async (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    try {
      // Update the puppy without modifying its name
      await litterService.updatePuppy(selectedLitterId, updatedPuppy);
      setActiveLitters(await litterService.getActiveLitters());
      setArchivedLitters(await litterService.getArchivedLitters());
    } catch (error) {
      console.error('Error updating puppy:', error);
      toast({
        title: "Error",
        description: "Failed to update puppy. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePuppy = async (puppyId: string) => {
    if (!selectedLitterId) return;
    
    try {
      await litterService.deletePuppy(selectedLitterId, puppyId);
      setActiveLitters(await litterService.getActiveLitters());
      setArchivedLitters(await litterService.getArchivedLitters());
    } catch (error) {
      console.error('Error deleting puppy:', error);
      toast({
        title: "Error",
        description: "Failed to delete puppy. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLitter = async (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      try {
        await litterService.deleteLitter(litterId);
        setActiveLitters(await litterService.getActiveLitters());
        setArchivedLitters(await litterService.getArchivedLitters());
        
        // Select new litter if the deleted one was selected
        if (selectedLitterId === litterId) {
          const active = await litterService.getActiveLitters();
          const archived = await litterService.getArchivedLitters();
          
          if (active.length > 0) {
            setSelectedLitterId(active[0].id);
          } else if (archived.length > 0) {
            setSelectedLitterId(archived[0].id);
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
  };
  
  const handleArchiveLitter = async (litterId: string, archive: boolean) => {
    try {
      await litterService.toggleArchiveLitter(litterId, archive);
      setActiveLitters(await litterService.getActiveLitters());
      setArchivedLitters(await litterService.getArchivedLitters());
      
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
  };
  
  // Get available years for filtering
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };
  
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
    handleUpdateLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleDeleteLitter,
    handleArchiveLitter,
    handleSelectLitter,
    getAvailableYears
  };
}
