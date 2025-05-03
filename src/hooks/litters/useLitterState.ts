
import { useState } from 'react';
import { Litter, Puppy } from '@/types/breeding';

export function useLitterState() {
  // State for litters data
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [plannedLitters, setPlannedLitters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);

  return {
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
  };
}
