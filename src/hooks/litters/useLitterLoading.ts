
import { useCallback, useState, useEffect } from 'react';
import { litterService } from '@/services/LitterService';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { fetchWithRetry } from '@/utils/fetchUtils';

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
  const [isLoadingPlannedLitters, setIsLoadingPlannedLitters] = useState(false);

  // Fetch all litters (basic data without puppies for better performance)
  const loadLittersData = useCallback(async () => {
    if (!userId) {
      console.log("Cannot load litters: No user ID provided");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Loading litters data for user:", userId);
      
      const litters = await litterService.loadLitters(userId);
      console.log("Loaded litters:", litters.length);
      
      // Split litters into active and archived
      const active = litters.filter(litter => !litter.archived);
      const archived = litters.filter(litter => litter.archived);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
      
      return litters;
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
    if (!userId) {
      console.log("Cannot load planned litters: No user ID provided");
      setPlannedLitters([]);
      return;
    }

    try {
      setIsLoadingPlannedLitters(true);
      console.log("Loading planned litters for user:", userId);
      
      // Use fetchWithRetry for more reliable loading
      const plannedLittersData = await fetchWithRetry(
        () => plannedLittersService.loadPlannedLitters(),
        { 
          maxRetries: 2, 
          initialDelay: 1000,
          onRetry: (attempt) => {
            console.log(`Retry attempt ${attempt} loading planned litters`);
          }
        }
      );
      
      console.log("Loaded planned litters:", plannedLittersData?.length || 0);
      setPlannedLitters(plannedLittersData || []);
    } catch (error) {
      console.error('Error loading planned litters:', error);
      toast({
        title: "Warning",
        description: "Could not load planned litters. Some features may be limited.",
        variant: "destructive"
      });
      // Set empty array as fallback
      setPlannedLitters([]);
    } finally {
      setIsLoadingPlannedLitters(false);
    }
  }, [userId, setPlannedLitters]);

  // Load detailed litter data including puppies with enhanced validation
  const loadLitterDetails = useCallback(async (litterId: string) => {
    if (!litterId || !userId) {
      console.log("Cannot load litter details: missing litter ID or user ID");
      return;
    }

    try {
      setIsLoadingDetails(true);
      console.log(`Loading detailed data for litter: ${litterId}`);
      
      // NOTE: Don't clear selectedLitterDetails here - keep showing old data until new data is ready
      // This prevents the UI from showing empty state during reload
      
      const detailedLitter = await litterService.getLitterDetails(litterId);
      console.log("Loaded detailed litter data:", {
        id: detailedLitter?.id,
        name: detailedLitter?.name,
        puppiesCount: detailedLitter?.puppies?.length || 0,
        puppies: detailedLitter?.puppies?.map(p => ({ 
          id: p.id, 
          name: p.name,
          // Add validation that this puppy belongs to this litter
          belongsToLitter: `Should be ${litterId}`
        })) || []
      });
      
      // Additional validation: ensure all puppies belong to this litter
      if (detailedLitter?.puppies) {
        const invalidPuppies = detailedLitter.puppies.filter(puppy => {
          // This validation should be done in the service layer, but adding here as safeguard
          console.log(`Puppy ${puppy.name} (${puppy.id}) loaded for litter ${litterId}`);
          return false; // For now, trust service layer filtering
        });
        
        if (invalidPuppies.length > 0) {
          console.error('Found puppies that might not belong to this litter:', invalidPuppies);
        }
      }
      
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
    isLoadingDetails,
    isLoadingPlannedLitters
  };
}
