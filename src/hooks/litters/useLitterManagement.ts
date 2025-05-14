
import { useEffect, useCallback, useState } from 'react';
import { Litter, Puppy, PlannedLitter } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';
import { useLitterState } from './useLitterState';
import { useLitterLoading } from './useLitterLoading';
import { useLitterOperations } from './useLitterOperations';
import { useLitterUtils } from './useLitterUtils';
import { useLitterSubscription } from './useLitterSubscription';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from './queries/useAddLitterMutation';

export function useLitterManagement() {
  // Add useAuth to get the current user
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
  
  // Use the loading hooks with new detail loading capability
  const { 
    loadLittersData, 
    loadPlannedLitters,
    loadLitterDetails,
    selectedLitterDetails: loadedLitterDetails,
    isLoadingPlannedLitters
  } = useLitterLoading(
    setActiveLitters,
    setArchivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    setPlannedLitters,
    setIsLoading,
    user?.id
  );
  
  // Update selectedLitterDetails when it changes in useLitterLoading
  useEffect(() => {
    if (loadedLitterDetails) {
      setSelectedLitterDetails(loadedLitterDetails);
    }
  }, [loadedLitterDetails, setSelectedLitterDetails]);
  
  // Use the operations hook, passing selectedLitterId as an argument
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
  
  // Use subscription hook
  const { setupSubscription } = useLitterSubscription(loadLittersData, user?.id);
  
  // Enhanced refresh function that first invalidates React Query and then does a manual load
  const refreshLitters = useCallback(async () => {
    try {
      console.log("Manually refreshing all litters");
      
      // First invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      
      // Then do a manual refresh
      const result = await loadLittersData();
      return result;
    } catch (error) {
      console.error("Error refreshing litters:", error);
    }
  }, [queryClient, loadLittersData]);
  
  // Initial data load
  useEffect(() => {
    console.log("Initial useEffect running, user:", user?.id);
    
    // Load data only if we have a user
    if (user?.id) {
      loadLittersData();
      loadPlannedLitters();
      
      // Set up and clean up subscription
      const cleanup = setupSubscription();
      return cleanup;
    } else {
      console.log("No user ID available, cannot load litters");
      setActiveLitters([]);
      setArchivedLitters([]);
    }
  }, [loadLittersData, loadPlannedLitters, setupSubscription, user?.id, setActiveLitters, setArchivedLitters]);
  
  // Load detailed litter data when selectedLitterId changes
  useEffect(() => {
    if (selectedLitterId && user?.id) {
      console.log("Selected litter changed, loading details:", selectedLitterId);
      loadLitterDetails(selectedLitterId);
    }
  }, [selectedLitterId, user?.id, loadLitterDetails]);
  
  // Auto-select first litter when activeLitters changes and none is selected
  useEffect(() => {
    if (!selectedLitterId && activeLitters.length > 0 && !isLoading) {
      console.log("Auto-selecting first litter:", activeLitters[0].id);
      setSelectedLitterId(activeLitters[0].id);
    }
  }, [activeLitters, selectedLitterId, isLoading, setSelectedLitterId]);
  
  // Handle selecting a litter
  const handleSelectLitter = useCallback((litter: Litter) => {
    console.log("Selected litter:", litter.id);
    setSelectedLitterId(litter.id);
  }, [setSelectedLitterId]);
  
  // Get the currently selected litter - prioritize detailed data if available
  const selectedLitter = selectedLitterDetails || findSelectedLitter(selectedLitterId);
  
  // Create wrapper functions with proper parameters
  const handleUpdateLitter = useCallback((litter: Litter) => {
    return updateLitter(litter);
  }, [updateLitter]);
  
  const handleAddPuppy = useCallback((puppy: Puppy) => {
    return addPuppy(selectedLitterId, puppy);
  }, [addPuppy, selectedLitterId]);
  
  const handleUpdatePuppy = useCallback((puppy: Puppy) => {
    return updatePuppy(selectedLitterId, puppy);
  }, [updatePuppy, selectedLitterId]);
  
  const handleDeletePuppy = useCallback((puppyId: string) => {
    return deletePuppy(selectedLitterId, puppyId);
  }, [deletePuppy, selectedLitterId]);

  // Add a function to refresh planned litters
  const refreshPlannedLitters = useCallback(() => {
    console.log("Manually refreshing planned litters");
    return loadPlannedLitters();
  }, [loadPlannedLitters]);
  
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
    refreshLitters
  };
}

export default useLitterManagement;
