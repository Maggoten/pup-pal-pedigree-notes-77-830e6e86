
import { useState } from 'react';
import { Litter, PlannedLitter } from '@/types/breeding';

export function useLitterState() {
  // Lists of litters
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  
  // Selection and UI state
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [selectedLitterDetails, setSelectedLitterDetails] = useState<Litter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [showAddLitterDialog, setShowAddLitterDialog] = useState<boolean>(false);

  return {
    activeLitters,
    setActiveLitters,
    archivedLitters,
    setArchivedLitters,
    plannedLitters,
    setPlannedLitters,
    selectedLitterId,
    setSelectedLitterId,
    selectedLitterDetails,
    setSelectedLitterDetails,
    isLoading,
    setIsLoading,
    isLoadingDetails,
    setIsLoadingDetails,
    showAddLitterDialog,
    setShowAddLitterDialog
  };
}
