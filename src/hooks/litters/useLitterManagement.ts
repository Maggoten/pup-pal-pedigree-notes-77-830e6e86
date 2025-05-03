
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
    plannedLitters,
    setPlannedLitters,
    isLoading,
    setIsLoading,
    showAddLitterDialog,
    setShowAddLitterDialog
  } = useLitterState();
  
  // Use the loading hooks
  const { loadLittersData, loadPlannedLitters } = useLitterLoading(
    setActiveLitters,
    setArchivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    setPlannedLitters,
    setIsLoading,
    user?.id
  );
  
  // Use the operations hook
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
    archivedLitters
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
  }, [loadLittersData, loadPlannedLitters, setupSubscription, user?.id]);
  
  // Handle selecting a litter
  const handleSelectLitter = useCallback((litter: Litter) => {
    setSelectedLitterId(litter.id);
  }, [setSelectedLitterId]);
  
  // Get the currently selected litter
  const selectedLitter = findSelectedLitter(selectedLitterId);
  
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
