
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
      console.log(`Loading litter details for ${loadedLitterDetails.name}:`, {
        id: loadedLitterDetails.id,
        puppiesCount: loadedLitterDetails.puppies?.length || 0,
        puppies: loadedLitterDetails.puppies?.map(p => ({ id: p.id, name: p.name })) || []
      });
      setSelectedLitterDetails(loadedLitterDetails);
    }
  }, [loadedLitterDetails, setSelectedLitterDetails]);
  
  // Use the operations hook, passing selectedLitterId as an argument
  const {
    handleAddLitter: originalHandleAddLitter,
    updateLitter,
    addPuppy,
    updatePuppy,
    deletePuppy,
    deleteLitter,
    archiveLitter
  } = useLitterOperations(
    loadLittersData,
    loadLitterDetails,
    setActiveLitters,
    setArchivedLitters,
    setSelectedLitterId,
    activeLitters,
    archivedLitters,
    selectedLitterId
  );
  
  // Enhanced handleAddLitter with proper state cleanup
  const handleAddLitter = useCallback(async (newLitter: Litter) => {
    try {
      console.log('Adding new litter, clearing previous selected litter details');
      
      // Clear selected litter details immediately to prevent showing old data
      setSelectedLitterDetails(null);
      
      // Add the litter
      const result = await originalHandleAddLitter(newLitter);
      
      // Set the new litter as selected
      console.log(`Setting new litter ${newLitter.id} as selected`);
      setSelectedLitterId(newLitter.id);
      
      return result;
    } catch (error) {
      console.error('Error in enhanced handleAddLitter:', error);
      throw error;
    }
  }, [originalHandleAddLitter, setSelectedLitterDetails, setSelectedLitterId]);
  
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
      
      // Clear selected litter details to prevent stale data
      setSelectedLitterDetails(null);
      
      // Then do a manual refresh
      const result = await loadLittersData();
      return result;
    } catch (error) {
      console.error("Error refreshing litters:", error);
    }
  }, [queryClient, loadLittersData, setSelectedLitterDetails]);
  
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
      setSelectedLitterDetails(null);
    }
  }, [loadLittersData, loadPlannedLitters, setupSubscription, user?.id, setActiveLitters, setArchivedLitters, setSelectedLitterDetails]);
  
  // Enhanced litter selection handler with proper state cleanup
  const handleSelectLitter = useCallback((litter: Litter) => {
    console.log(`Selecting litter: ${litter.name} (${litter.id})`);
    
    // If it's the same litter, don't reload
    if (selectedLitterId === litter.id) {
      console.log('Same litter selected, skipping reload');
      return;
    }
    
    // Clear previous litter details immediately
    setSelectedLitterDetails(null);
    
    // Set the new selected litter ID
    setSelectedLitterId(litter.id);
  }, [selectedLitterId, setSelectedLitterDetails, setSelectedLitterId]);
  
  // Load detailed litter data when selectedLitterId changes
  useEffect(() => {
    if (selectedLitterId && user?.id) {
      console.log(`Selected litter changed to ${selectedLitterId}, loading details`);
      
      // Clear previous details first
      setSelectedLitterDetails(null);
      
      // Load new details
      loadLitterDetails(selectedLitterId);
    } else if (!selectedLitterId) {
      // Clear details if no litter is selected
      setSelectedLitterDetails(null);
    }
  }, [selectedLitterId, user?.id, loadLitterDetails, setSelectedLitterDetails]);
  
  // Auto-select first litter when activeLitters changes and none is selected
  useEffect(() => {
    if (!selectedLitterId && activeLitters.length > 0 && !isLoading) {
      console.log("Auto-selecting first litter:", activeLitters[0].id);
      setSelectedLitterId(activeLitters[0].id);
    }
  }, [activeLitters, selectedLitterId, isLoading, setSelectedLitterId]);
  
  // Get the currently selected litter - prioritize detailed data if available
  const selectedLitter = selectedLitterDetails || findSelectedLitter(selectedLitterId);
  
  // Enhanced logging for debugging
  useEffect(() => {
    if (selectedLitter) {
      console.log(`Current selected litter: ${selectedLitter.name}`, {
        id: selectedLitter.id,
        puppiesCount: selectedLitter.puppies?.length || 0,
        isDetailed: !!selectedLitterDetails,
        puppies: selectedLitter.puppies?.map(p => ({ 
          id: p.id, 
          name: p.name,
          validatedLitterId: 'litter_id validation needed in service' 
        })) || []
      });
    }
  }, [selectedLitter, selectedLitterDetails]);
  
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
