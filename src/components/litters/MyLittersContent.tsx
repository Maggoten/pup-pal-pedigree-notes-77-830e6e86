
import React, { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { 
  Tabs, 
  TabsContent, 
} from '@/components/ui/tabs';
import { useLitterFilters } from './LitterFilterProvider';
import { useLittersQuery } from '@/hooks/useLittersQuery';
import useLitterFilteredData from '@/hooks/useLitterFilteredData';
import SelectedLitterSection from './SelectedLitterSection';
import LitterFilterHeader from './filters/LitterFilterHeader';
import LitterTabContent from './tabs/LitterTabContent';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { plannedLittersService } from '@/services/planned-litters';
import { Litter } from '@/types/breeding';

const MyLittersContent: React.FC = () => {
  // Use our new React Query hook for data fetching
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
  
  // Handle creating a new litter
  const handleAddLitterClick = () => {
    setShowAddLitterDialog(true);
  };
  
  // Handle selecting a litter
  const handleSelectLitter = (litter: Litter) => {
    setSelectedLitterId(litter.id);
  };
  
  const handleClearFilter = () => {
    setFilterYear(null);
    setSearchQuery('');
  };
  
  const handleArchiveLitter = (litterId: string, archive: boolean) => {
    archiveLitter(litterId, archive);
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
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<PawPrint className="h-6 w-6" />}
    >
      {/* Main content container with fixed dimensions */}
      <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 pb-6 min-h-[600px] stable-layout">
        <Tabs 
          value={categoryTab} 
          onValueChange={setCategoryTab} 
          className="space-y-4" 
          defaultValue={categoryTab}
        >
          {isLoading ? (
            <>
              <div className="flex items-center justify-between border-b mb-4 pb-3">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
              <div className="space-y-4 no-content-jump">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              </div>
            </>
          ) : (
            <>
              <LitterFilterHeader 
                activeLitters={activeLitters}
                archivedLitters={archivedLitters}
                categoryTab={categoryTab}
                setCategoryTab={setCategoryTab}
                showAddLitterDialog={showAddLitterDialog}
                setShowAddLitterDialog={setShowAddLitterDialog}
                onAddLitter={addLitter}
                plannedLitters={plannedLitters}
                availableYears={getAvailableYears()}
              />
              
              <TabsContent value="active" className="space-y-6 min-h-[400px] stable-layout">
                <LitterTabContent
                  litters={activeLitters}
                  filteredLitters={filteredActiveLitters}
                  paginatedLitters={paginatedActiveLitters}
                  selectedLitterId={selectedLitterId}
                  onSelectLitter={handleSelectLitter}
                  onAddLitter={handleAddLitterClick}
                  onArchive={(litter) => handleArchiveLitter(litter.id, true)}
                  pageCount={activePageCount}
                  currentPage={activePage}
                  onPageChange={setActivePage}
                  isFilterActive={isFilterActive}
                  onClearFilter={handleClearFilter}
                />
              </TabsContent>
              
              <TabsContent value="archived" className="space-y-6 min-h-[400px] stable-layout">
                <LitterTabContent
                  litters={archivedLitters}
                  filteredLitters={filteredArchivedLitters}
                  paginatedLitters={paginatedArchivedLitters}
                  selectedLitterId={selectedLitterId}
                  onSelectLitter={handleSelectLitter}
                  onAddLitter={handleAddLitterClick}
                  onArchive={(litter) => handleArchiveLitter(litter.id, false)}
                  pageCount={archivedPageCount}
                  currentPage={archivedPage}
                  onPageChange={setArchivedPage}
                  isFilterActive={isFilterActive}
                  onClearFilter={handleClearFilter}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      
      {/* Selected litter section with consistent height */}
      {selectedLitter && (
        <div className="mt-6 stable-layout">
          <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 min-h-[300px] transform-gpu">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-60 w-full" />
              </div>
            ) : (
              <SelectedLitterSection
                selectedLitter={selectedLitter}
                onUpdateLitter={updateLitter}
                onDeleteLitter={deleteLitter}
                onArchiveLitter={archiveLitter}
                onAddPuppy={handleAddPuppy}
                onUpdatePuppy={handleUpdatePuppy}
                onDeletePuppy={deletePuppy}
              />
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default MyLittersContent;
