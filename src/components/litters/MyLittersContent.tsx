
import React, { useEffect, useState } from 'react';
import { useLitterFilters } from './LitterFilterProvider';
import { useLittersQuery } from '@/hooks/useLittersQuery';
import useLitterFilteredData from '@/hooks/useLitterFilteredData';
import { Litter } from '@/types/breeding';
import { plannedLittersService } from '@/services/planned-litters';
import LittersPageLayout from './layout/LittersPageLayout';
import LitterTabsContainer from './layout/LitterTabsContainer';
import ActiveLitterDisplay from './layout/ActiveLitterDisplay';

const MyLittersContent: React.FC = () => {
  // Use our React Query hook for data fetching
  const {
    activeLitters,
    archivedLitters,
    isLoading,
    addLitter,
    updateLitter,
    deleteLitter,
    archiveLitter,
    addPuppy,
    updatePuppy,
    deletePuppy,
    getAvailableYears
  } = useLittersQuery();
  
  // Selected litter state
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [plannedLitters, setPlannedLitters] = useState<any[]>([]);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  
  // Get filter state from context
  const { 
    setSearchQuery,
    setFilterYear,
    categoryTab, 
    setCategoryTab,
    activePage,
    setActivePage,
    archivedPage,
    setArchivedPage
  } = useLitterFilters();
  
  // Load planned litters only when needed
  useEffect(() => {
    const loadPlannedLitters = async () => {
      try {
        const plannedLittersData = await plannedLittersService.loadPlannedLitters();
        setPlannedLitters(plannedLittersData);
      } catch (error) {
        console.error('Error loading planned litters:', error);
      }
    };
    
    loadPlannedLitters();
  }, []);
  
  // Set selected litter when data is loaded
  useEffect(() => {
    if (activeLitters.length > 0 && !selectedLitterId) {
      setSelectedLitterId(activeLitters[0].id);
    } else if (activeLitters.length === 0 && archivedLitters.length > 0 && !selectedLitterId) {
      setSelectedLitterId(archivedLitters[0].id);
    }
  }, [activeLitters, archivedLitters, selectedLitterId]);
  
  // Use our hook for filtering logic
  const {
    filteredActiveLitters,
    paginatedActiveLitters,
    activePageCount,
    filteredArchivedLitters,
    paginatedArchivedLitters,
    archivedPageCount,
    isFilterActive
  } = useLitterFilteredData(activeLitters, archivedLitters);
  
  // Find the currently selected litter
  const selectedLitter = selectedLitterId 
    ? [...activeLitters, ...archivedLitters].find(litter => litter.id === selectedLitterId) 
    : null;
  
  const handleSelectLitter = (litter: Litter) => {
    setSelectedLitterId(litter.id);
  };
  
  const handleClearFilter = () => {
    setFilterYear(null);
    setSearchQuery('');
  };
  
  // Create wrapper functions to correctly pass the selected litter ID with puppy operations
  const handleAddPuppy = (puppy: any) => {
    if (selectedLitter) {
      addPuppy(puppy, selectedLitter.id);
    }
  };
  
  const handleUpdatePuppy = (puppy: any) => {
    if (selectedLitter) {
      updatePuppy(puppy, selectedLitter.id);
    }
  };
  
  return (
    <LittersPageLayout isLoading={isLoading}>
      {/* Main content container - Tabs for active/archived litters */}
      <LitterTabsContainer 
        isLoading={isLoading}
        activeLitters={activeLitters}
        archivedLitters={archivedLitters}
        categoryTab={categoryTab}
        setCategoryTab={setCategoryTab}
        showAddLitterDialog={showAddLitterDialog}
        setShowAddLitterDialog={setShowAddLitterDialog}
        onAddLitter={addLitter}
        plannedLitters={plannedLitters}
        getAvailableYears={getAvailableYears}
        filteredActiveLitters={filteredActiveLitters}
        paginatedActiveLitters={paginatedActiveLitters}
        filteredArchivedLitters={filteredArchivedLitters}
        paginatedArchivedLitters={paginatedArchivedLitters}
        selectedLitterId={selectedLitterId}
        onSelectLitter={handleSelectLitter}
        onArchiveLitter={archiveLitter}
        isFilterActive={isFilterActive}
        onClearFilter={handleClearFilter}
        activePageCount={activePageCount}
        activePage={activePage}
        setActivePage={setActivePage}
        archivedPageCount={archivedPageCount}
        archivedPage={archivedPage}
        setArchivedPage={setArchivedPage}
      />
      
      {/* Selected litter display section */}
      <ActiveLitterDisplay 
        isLoading={isLoading}
        selectedLitter={selectedLitter}
        onUpdateLitter={updateLitter}
        onDeleteLitter={deleteLitter}
        onArchiveLitter={archiveLitter}
        onAddPuppy={handleAddPuppy}
        onUpdatePuppy={handleUpdatePuppy}
        onDeletePuppy={deletePuppy}
      />
    </LittersPageLayout>
  );
};

export default MyLittersContent;
