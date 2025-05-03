
import { useEffect, useCallback } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';
import { useLitterState } from './useLitterState';
import { useLitterLoading } from './useLitterLoading';
import { useLitterOperations } from './useLitterOperations';
import { useLitterUtils } from './useLitterUtils';
import { useLitterSubscription } from './useLitterSubscription';

export function useLitterManagement() {
  // Add useAuth to get the current user
  const { user } = useAuth();
  
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
    selectedLitterDetails: loadedLitterDetails
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
    handleAddLitter,
    handleUpdateLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleDeleteLitter: deleteLitter,
    handleArchiveLitter: archiveLitter,
    handleSelectLitter,
    getAvailableYears
  };
}

export default useLitterManagement;
