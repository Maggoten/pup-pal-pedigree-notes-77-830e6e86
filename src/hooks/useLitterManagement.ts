
import { useState, useEffect, useCallback } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { supabaseLitterService } from '@/services/supabase/litterService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

export function useLitterManagement() {
  // State for litters data
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [plannedLitters, setPlannedLitters] = useState<any[]>([]); // We'll fetch these from Supabase
  const [isLoading, setIsLoading] = useState(false);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  
  // Get auth context
  const { user } = useAuth();
  
  // Load litters on component mount and when user changes
  useEffect(() => {
    const loadLitters = async () => {
      if (!user) {
        // If user isn't logged in, don't try to fetch data
        return;
      }
      
      setIsLoading(true);
      try {
        const litters = await supabaseLitterService.loadLitters();
        
        // Sort litters by date (newest first)
        const sortByDate = (a: Litter, b: Litter) => 
          new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
        
        const active = litters.filter(litter => !litter.archived);
        const archived = litters.filter(litter => litter.archived);
        
        setActiveLitters(active.sort(sortByDate));
        setArchivedLitters(archived.sort(sortByDate));
        
        // Select the newest active litter by default
        if (active.length > 0 && !selectedLitterId) {
          setSelectedLitterId(active[0].id);
        } else if (active.length === 0 && archived.length > 0) {
          setSelectedLitterId(archived[0].id);
        }
        
        // Load planned litters too (using planned litters service)
        try {
          const plannedLittersData = await plannedLittersService.loadPlannedLitters();
          setPlannedLitters(plannedLittersData);
        } catch (error) {
          console.error('Error loading planned litters:', error);
        }
      } catch (error) {
        console.error('Error loading litters:', error);
        toast({
          title: 'Error',
          description: 'Failed to load litters',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLitters();
  }, [user]);
  
  // Handlers for litter operations
  const handleAddLitter = useCallback(async (newLitter: Litter) => {
    // Initialize puppies array if it doesn't exist
    if (!newLitter.puppies) {
      newLitter.puppies = [];
    }
    
    // Set archived to false as default
    newLitter.archived = false;
    
    const result = await supabaseLitterService.addLitter(newLitter);
    if (result) {
      // Reload the litters to get the updated list
      const updatedLitters = await supabaseLitterService.loadLitters();
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      // Select the newly created litter
      setSelectedLitterId(result.id);
      
      toast({
        title: "Litter Added",
        description: `${newLitter.name} has been added successfully.`
      });
    }
  }, []);
  
  const handleUpdateLitter = useCallback(async (updatedLitter: Litter) => {
    const result = await supabaseLitterService.updateLitter(updatedLitter);
    
    if (result) {
      // Reload all litters to get the updated list
      const updatedLitters = await supabaseLitterService.loadLitters();
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      toast({
        title: "Litter Updated",
        description: `${updatedLitter.name} has been updated successfully.`
      });
    }
  }, []);
  
  const handleAddPuppy = useCallback(async (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const result = await supabaseLitterService.addPuppy(selectedLitterId, newPuppy);
    
    if (result) {
      // Reload all litters to get the updated list with the new puppy
      const updatedLitters = await supabaseLitterService.loadLitters();
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      toast({
        title: "Puppy Added",
        description: `${newPuppy.name} has been added to the litter.`
      });
    }
  }, [selectedLitterId]);
  
  const handleUpdatePuppy = useCallback(async (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const result = await supabaseLitterService.updatePuppy(selectedLitterId, updatedPuppy);
    
    if (result) {
      // Reload all litters to get the updated list
      const updatedLitters = await supabaseLitterService.loadLitters();
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      toast({
        title: "Puppy Updated",
        description: `${updatedPuppy.name} has been updated successfully.`
      });
    }
  }, [selectedLitterId]);

  const handleDeletePuppy = useCallback(async (puppyId: string) => {
    const result = await supabaseLitterService.deletePuppy(puppyId);
    
    if (result) {
      // Reload all litters to get the updated list
      const updatedLitters = await supabaseLitterService.loadLitters();
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      toast({
        title: "Puppy Deleted",
        description: "The puppy has been deleted successfully."
      });
    }
  }, []);

  const handleDeleteLitter = useCallback(async (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      const result = await supabaseLitterService.deleteLitter(litterId);
      
      if (result) {
        // Reload all litters to get the updated list
        const updatedLitters = await supabaseLitterService.loadLitters();
        const active = updatedLitters.filter(litter => !litter.archived);
        const archived = updatedLitters.filter(litter => litter.archived);
        
        setActiveLitters(active);
        setArchivedLitters(archived);
        
        // Select new litter if the deleted one was selected
        if (selectedLitterId === litterId) {
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
      }
    }
  }, [selectedLitterId]);
  
  const handleArchiveLitter = useCallback(async (litterId: string, archive: boolean) => {
    const result = await supabaseLitterService.toggleArchiveLitter(litterId, archive);
    
    if (result) {
      // Reload all litters to get the updated list
      const updatedLitters = await supabaseLitterService.loadLitters();
      const active = updatedLitters.filter(litter => !litter.archived);
      const archived = updatedLitters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      toast({
        title: archive ? "Litter Archived" : "Litter Activated",
        description: archive 
          ? "The litter has been moved to the archive." 
          : "The litter has been moved to active litters."
      });
    }
  }, []);
  
  // Get available years for filtering
  const getAvailableYears = useCallback(() => {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  }, [activeLitters, archivedLitters]);
  
  // Find the currently selected litter
  const selectedLitter = selectedLitterId 
    ? [...activeLitters, ...archivedLitters].find(litter => litter.id === selectedLitterId) 
    : null;
  
  // Handle selecting a litter
  const handleSelectLitter = useCallback((litter: Litter) => {
    setSelectedLitterId(litter.id);
  }, []);

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

// Import the planned litters service for backward compatibility
import { plannedLittersService } from '@/services/planned-litters/plannedLittersService';
