
import React from 'react';
import { PawPrint } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { 
  Tabs, 
  TabsContent, 
} from '@/components/ui/tabs';
import { useLitterFilters } from './LitterFilterProvider';
import { useLitterManagement } from '@/hooks/useLitterManagement';
import useLitterFilteredData from '@/hooks/useLitterFilteredData';
import SelectedLitterSection from './SelectedLitterSection';
import LitterFilterHeader from './filters/LitterFilterHeader';
import LitterTabContent from './tabs/LitterTabContent';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const MyLittersContent: React.FC = () => {
  const {
    activeLitters,
    archivedLitters,
    selectedLitterId,
    plannedLitters,
    showAddLitterDialog,
    setShowAddLitterDialog,
    selectedLitter,
    isLoading,
    handleAddLitter,
    handleUpdateLitter,
    handleDeleteLitter,
    handleArchiveLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleSelectLitter,
    getAvailableYears
  } = useLitterManagement();
  
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
  
  // Handle creating a new litter
  const handleAddLitterClick = () => {
    setShowAddLitterDialog(true);
  };
  
  const handleClearFilter = () => {
    setFilterYear(null);
    setSearchQuery('');
  };
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 pb-6">
        <Tabs value={categoryTab} onValueChange={setCategoryTab} className="space-y-4" defaultValue={categoryTab}>
          {isLoading ? (
            <>
              <div className="flex items-center justify-between border-b mb-4 pb-3">
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-10 w-36" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
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
                onAddLitter={handleAddLitter}
                plannedLitters={plannedLitters}
                availableYears={getAvailableYears()}
              />
              
              <TabsContent value="active" className="space-y-6">
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
              
              <TabsContent value="archived" className="space-y-6">
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
      
      {isLoading ? (
        selectedLitter && (
          <div className="mt-6 space-y-6">
            <div className="bg-greige-50 rounded-lg border border-greige-300 p-4">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        )
      ) : (
        selectedLitter && (
          <div className="mt-6 space-y-6">
            <div className="bg-greige-50 rounded-lg border border-greige-300 p-4">
              <SelectedLitterSection
                selectedLitter={selectedLitter}
                onUpdateLitter={handleUpdateLitter}
                onDeleteLitter={handleDeleteLitter}
                onArchiveLitter={handleArchiveLitter}
                onAddPuppy={handleAddPuppy}
                onUpdatePuppy={handleUpdatePuppy}
                onDeletePuppy={handleDeletePuppy}
              />
            </div>
          </div>
        )
      )}
    </PageLayout>
  );
};

export default MyLittersContent;
