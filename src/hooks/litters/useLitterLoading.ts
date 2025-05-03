
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { supabase } from '@/integrations/supabase/client';
import { Litter } from '@/types/breeding';

export function useLitterLoading(
  setActiveLitters, 
  setArchivedLitters, 
  selectedLitterId,
  setSelectedLitterId,
  setPlannedLitters,
  setIsLoading,
  userId
) {
  // New state for tracking detailed litter loading
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [selectedLitterDetails, setSelectedLitterDetails] = useState<Litter | null>(null);

  // Load basic litter data - extracted for reusability
  const loadLittersData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading litters data with current user:", userId);
      
      const active = await litterService.getActiveLitters();
      const archived = await litterService.getArchivedLitters();
      
      // Sort litters by date (newest first)
      const sortByDate = (a, b) => 
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      
      const sortedActive = active.sort(sortByDate);
      const sortedArchived = archived.sort(sortByDate);
      
      console.log("Loaded active litters:", sortedActive.length);
      console.log("Loaded archived litters:", sortedArchived.length);
      
      setActiveLitters(sortedActive);
      setArchivedLitters(sortedArchived);
      
      // Select the newest active litter by default if no litter is selected
      if (sortedActive.length > 0 && !selectedLitterId) {
        // Only set the ID, will load details when needed
        setSelectedLitterId(sortedActive[0].id);
      } else if (sortedActive.length === 0 && sortedArchived.length > 0 && !selectedLitterId) {
        setSelectedLitterId(sortedArchived[0].id);
      }

      // If a litter is already selected, load its details
      if (selectedLitterId) {
        loadLitterDetails(selectedLitterId);
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
  }, [selectedLitterId, userId, setActiveLitters, setArchivedLitters, setSelectedLitterId, setIsLoading]);
  
  // New function to load detailed information for a specific litter
  const loadLitterDetails = useCallback(async (litterId: string) => {
    if (!litterId) return;
    
    setIsLoadingDetails(true);
    try {
      console.log(`Loading details for litter ${litterId}`);
      const litterWithDetails = await litterService.getLitterDetails(litterId);
      
      if (litterWithDetails) {
        // Update the selected litter with detailed information
        setSelectedLitterDetails(litterWithDetails);
        console.log(`Loaded ${litterWithDetails.puppies.length} puppies for litter ${litterWithDetails.name}`);
      } else {
        console.warn(`No details found for litter ${litterId}`);
        setSelectedLitterDetails(null);
      }
    } catch (error) {
      console.error(`Error loading details for litter ${litterId}:`, error);
      toast({
        title: "Error Loading Litter Details",
        description: "Failed to load details for the selected litter.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // Function to load planned litters
  const loadPlannedLitters = useCallback(async () => {
    try {
      const loadedPlannedLitters = await plannedLittersService.loadPlannedLitters();
      setPlannedLitters(loadedPlannedLitters);
    } catch (error) {
      console.error('Error loading planned litters:', error);
    }
  }, [setPlannedLitters]);

  return {
    loadLittersData,
    loadPlannedLitters,
    loadLitterDetails,
    isLoadingDetails,
    selectedLitterDetails
  };
}
