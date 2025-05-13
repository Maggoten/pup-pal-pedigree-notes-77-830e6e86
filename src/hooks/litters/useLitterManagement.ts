import { useEffect, useCallback, useState } from 'react';
import { Litter, Puppy, PlannedLitter } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';
import { useLitterState } from './useLitterState';
import { useLitterQueries } from './queries/useLitterQueries';
import { useActiveLittersQuery } from './queries/useActiveLittersQuery';
import { useArchivedLittersQuery } from './queries/useArchivedLittersQuery';
import { useLitterOperations } from './useLitterOperations';
import { useLitterUtils } from './useLitterUtils';
import { useLitterSubscription } from './useLitterSubscription';
import { litterService } from '@/services/LitterService';
import { plannedLittersService } from '@/services/planned-litters/plannedLittersService';

export function useLitterManagement() {
  // Add useAuth to get the current user
  const { user } = useAuth();
  
  // Use React Query hooks directly for data
  const { data: activeQueryLitters, isLoading: isLoadingActive } = useActiveLittersQuery();
  const { data: archivedQueryLitters, isLoading: isLoadingArchived } = useArchivedLittersQuery();
  
  // Use the facade for fetch functions that match the old API
  const { fetchActiveLitters, fetchArchivedLitters } = useLitterQueries();
  
  // Use the separated state hook
  const {
    activeLitters,
    setActiveLitters,
    archivedLitters,
    setArchivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    selectedLitterDetails,
    setSelectedLitterDetails,
    plannedLitters,
    setPlannedLitters,
    isLoading,
    setIsLoading,
    isLoadingDetails,
    setIsLoadingDetails,
    showAddLitterDialog,
    setShowAddLitterDialog
  } = useLitterState();
  
  // Implementation of loadLittersData
  const loadLittersData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [active, archived] = await Promise.all([
        fetchActiveLitters(),
        fetchArchivedLitters()
      ]);
      
      setActiveLitters(active);
      setArchivedLitters(archived);
    } catch (error) {
      console.error("Error loading litters:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchActiveLitters, fetchArchivedLitters, setActiveLitters, setArchivedLitters, setIsLoading]);

  // Update state from React Query results when they change
  useEffect(() => {
    if (activeQueryLitters) {
      setActiveLitters(activeQueryLitters);
    }
  }, [activeQueryLitters, setActiveLitters]);

  useEffect(() => {
    if (archivedQueryLitters) {
      setArchivedLitters(archivedQueryLitters);
    }
  }, [archivedQueryLitters, setArchivedLitters]);

  // Implementation of loadLitterDetails
  const loadLitterDetails = useCallback(async (litterId: string) => {
    if (!user?.id || !litterId) return;
    
    setIsLoadingDetails(true);
    try {
      const details = await litterService.getLitterDetails(litterId);
      if (details) {
        setSelectedLitterDetails(details);
      }
    } catch (error) {
      console.error("Error loading litter details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [user?.id, setIsLoadingDetails, setSelectedLitterDetails]);

  // Implementation of loadPlannedLitters
  const loadPlannedLitters = useCallback(async () => {
    if (!user?.id) return;
    
    const [isLoadingPlannedLitters, setIsLoadingPlannedLitters] = useState(false);
    setIsLoadingPlannedLitters(true);
    try {
      const litters = await plannedLittersService.loadPlannedLitters();
      setPlannedLitters(litters as PlannedLitter[]);
    } catch (error) {
      console.error("Error loading planned litters:", error);
    } finally {
      setIsLoadingPlannedLitters(false);
    }
  }, [user?.id, setPlannedLitters]);
  
  // Use the operations hook with proper implementation
  const {
    handleAddLitter,
    updateLitter,
    addPuppy,
    updatePuppy,
    deletePuppy,
    deleteLitter,
    archiveLitter
  } = useLitterOperations(
    loadLittersData,
    setActiveLitters,
    setArchivedLitters,
    setSelectedLitterId,
    activeLitters,
    archivedLitters,
    selectedLitterId
  );
  
  // Use utility functions
  const { getAvailableYears, findSelectedLitter } = useLitterUtils(activeLitters, archivedLitters);
  
  // Use subscription hook properly with the required arguments
  const { setupSubscription } = useLitterSubscription(loadLittersData, user?.id);
  
  // Initial data load
  useEffect(() => {
    if (user?.id) {
      loadLittersData();
      loadPlannedLitters();
      
      // Set up subscription
      const cleanup = setupSubscription();
      return cleanup;
    }
  }, [user?.id, loadLittersData, loadPlannedLitters, setupSubscription]);
  
  // Load detailed litter data when selectedLitterId changes
  useEffect(() => {
    if (selectedLitterId && user?.id) {
      loadLitterDetails(selectedLitterId);
    }
  }, [selectedLitterId, user?.id, loadLitterDetails]);
  
  // Auto-select first litter when activeLitters changes and none is selected
  useEffect(() => {
    if (!selectedLitterId && activeLitters.length > 0 && !isLoading) {
      setSelectedLitterId(activeLitters[0].id);
    }
  }, [activeLitters, selectedLitterId, isLoading, setSelectedLitterId]);
  
  // Handle selecting a litter
  const handleSelectLitter = useCallback((litter: Litter) => {
    setSelectedLitterId(litter.id);
  }, [setSelectedLitterId]);
  
  // Get the currently selected litter - prioritize detailed data if available
  const selectedLitter = selectedLitterDetails || findSelectedLitter(selectedLitterId);
  
  // Create wrapper functions with proper parameters
  const handleUpdateLitter = useCallback((litter: Litter) => {
    return updateLitter(litter);
  }, [updateLitter]);
  
  const handleAddPuppy = useCallback((puppy: Puppy) => {
    if (!selectedLitterId) return Promise.reject("No litter selected");
    return addPuppy(selectedLitterId, puppy);
  }, [addPuppy, selectedLitterId]);
  
  const handleUpdatePuppy = useCallback((puppy: Puppy) => {
    if (!selectedLitterId) return Promise.reject("No litter selected");
    return updatePuppy(selectedLitterId, puppy);
  }, [updatePuppy, selectedLitterId]);
  
  const handleDeletePuppy = useCallback((puppyId: string) => {
    if (!selectedLitterId) return Promise.reject("No litter selected");
    return deletePuppy(selectedLitterId, puppyId);
  }, [deletePuppy, selectedLitterId]);

  // Add a function to refresh planned litters
  const refreshPlannedLitters = useCallback(() => {
    return loadPlannedLitters();
  }, [loadPlannedLitters]);

  // Determine if we're loading planned litters
  const [isLoadingPlannedLitters, setIsLoadingPlannedLitters] = useState(false);
  
  return {
    activeLitters,
    archivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    plannedLitters,
    showAddLitterDialog,
    setShowAddLitterDialog,
    selectedLitter,
    isLoading: isLoading || isLoadingActive || isLoadingArchived,
    isLoadingDetails,
    isLoadingPlannedLitters,
    handleAddLitter,
    handleUpdateLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleDeleteLitter: deleteLitter,
    handleArchiveLitter: archiveLitter,
    handleSelectLitter,
    getAvailableYears,
    refreshPlannedLitters,
    // Expose the loading functions for components that need them
    loadLittersData,
    loadPlannedLitters,
    loadLitterDetails,
    selectedLitterDetails
  };
}

export default useLitterManagement;
