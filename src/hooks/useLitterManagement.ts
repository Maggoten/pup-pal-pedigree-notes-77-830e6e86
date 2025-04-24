import { useState, useEffect } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { toast } from '@/components/ui/use-toast';

export function useLitterManagement() {
  // State for litters data
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [plannedLitters, setPlannedLitters] = useState([]);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  
  // Load litters on component mount
  useEffect(() => {
    const loadLitters = () => {
      const active = litterService.getActiveLitters();
      const archived = litterService.getArchivedLitters();
      
      // Sort litters by date (newest first)
      const sortByDate = (a: Litter, b: Litter) => 
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      
      setActiveLitters(active.sort(sortByDate));
      setArchivedLitters(archived.sort(sortByDate));
      
      // Select the newest active litter by default
      if (active.length > 0 && !selectedLitterId) {
        setSelectedLitterId(active[0].id);
      } else if (active.length === 0 && archived.length > 0) {
        setSelectedLitterId(archived[0].id);
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
  const handleAddLitter = (newLitter: Litter) => {
    newLitter.puppies = [];
    newLitter.archived = false;
    
    litterService.addLitter(newLitter);
    setActiveLitters(litterService.getActiveLitters());
    setSelectedLitterId(newLitter.id);
    
    toast({
      title: "Litter Added",
      description: `${newLitter.name} has been added successfully.`
    });
  };
  
  const handleUpdateLitter = (updatedLitter: Litter) => {
    litterService.updateLitter(updatedLitter);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: "Litter Updated",
      description: `${updatedLitter.name} has been updated successfully.`
    });
  };
  
  const handleAddPuppy = (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    // Add the puppy without modifying its name
    litterService.addPuppy(selectedLitterId, newPuppy);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: "Puppy Added",
      description: `${newPuppy.name} has been added to the litter.`
    });
  };
  
  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    // Update the puppy without modifying its name
    litterService.updatePuppy(selectedLitterId, updatedPuppy);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
  };

  const handleDeletePuppy = (puppyId: string) => {
    if (!selectedLitterId) return;
    
    litterService.deletePuppy(selectedLitterId, puppyId);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
  };

  const handleDeleteLitter = (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      litterService.deleteLitter(litterId);
      setActiveLitters(litterService.getActiveLitters());
      setArchivedLitters(litterService.getArchivedLitters());
      
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
    }
  };
  
  const handleArchiveLitter = (litterId: string, archive: boolean) => {
    litterService.toggleArchiveLitter(litterId, archive);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: archive ? "Litter Archived" : "Litter Activated",
      description: archive 
        ? "The litter has been moved to the archive." 
        : "The litter has been moved to active litters."
    });
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
