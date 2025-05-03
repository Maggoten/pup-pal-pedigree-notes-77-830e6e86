
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { litterService } from '@/services/LitterService';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { supabase } from '@/integrations/supabase/client';

export function useLitterLoading(
  setActiveLitters, 
  setArchivedLitters, 
  selectedLitterId,
  setSelectedLitterId,
  setPlannedLitters,
  setIsLoading,
  userId
) {
  // Load litters function - extracted for reusability
  const loadLittersData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading litters data with current user:", userId);
      
      // Debug auth state
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session data:", sessionData?.session ? {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
        isActive: !!sessionData.session
      } : "No active session");
      
      const active = await litterService.getActiveLitters();
      const archived = await litterService.getArchivedLitters();
      
      // Sort litters by date (newest first)
      const sortByDate = (a, b) => 
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
  }, [selectedLitterId, userId, setActiveLitters, setArchivedLitters, setSelectedLitterId, setIsLoading]);
  
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
    loadPlannedLitters
  };
}
