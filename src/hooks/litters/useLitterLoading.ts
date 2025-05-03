
import { useCallback, useState, useEffect } from 'react';
import { litterService } from '@/services/LitterService';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';

export function useLitterLoading(
  setActiveLitters,
  setArchivedLitters,
  selectedLitterId,
  setSelectedLitterId,
  setPlannedLitters,
  setIsLoading,
  userId
) {
  const [selectedLitterDetails, setSelectedLitterDetails] = useState<Litter | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch all litters (basic data without puppies for better performance)
  const loadLittersData = useCallback(async () => {
    if (!userId) {
      console.log("Cannot load litters: No user ID provided");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Loading litters data for user:", userId);
      
      const litters = await litterService.loadLitters();
      console.log("Loaded litters:", litters.length);
      
      // Split litters into active and archived
      const active = litters.filter(litter => !litter.archived);
      const archived = litters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
    } catch (error) {
      console.error('Error loading litters:', error);
      toast({
        title: "Error",
        description: "Failed to load litters. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setActiveLitters, setArchivedLitters, setIsLoading, userId]);

  // Fetch planned litters
  const loadPlannedLitters = useCallback(async () => {
    // This function would fetch planned litters if they are implemented
    setPlannedLitters([]);
  }, [setPlannedLitters]);

  // Load detailed litter data including puppies
  const loadLitterDetails = useCallback(async (litterId: string) => {
    if (!litterId || !userId) {
      console.log("Cannot load litter details: missing litter ID or user ID");
      return;
    }

    try {
      setIsLoadingDetails(true);
      console.log(`Loading detailed data for litter: ${litterId}`);
      
      const detailedLitter = await litterService.getLitterDetails(litterId);
      console.log("Loaded detailed litter data:", detailedLitter);
      console.log("Puppies count:", detailedLitter?.puppies?.length || 0);
      
      setSelectedLitterDetails(detailedLitter);
    } catch (error) {
      console.error('Error loading litter details:', error);
      toast({
        title: "Error",
        description: "Failed to load litter details. Please try again.",
        variant: "destructive"
      });
      setSelectedLitterDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [userId, setIsLoadingDetails]);

  return {
    loadLittersData,
    loadPlannedLitters,
    loadLitterDetails,
    selectedLitterDetails,
    isLoadingDetails
  };
}
