
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
  
  // Use our new hook for filtering logic
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
  
  if (isLoading) {
    return (
      <PageLayout 
        title="My Litters" 
        description="Track your litters and individual puppies"
        icon={<PawPrint className="h-6 w-6" />}
      >
        <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 pb-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 pb-6">
        <Tabs value={categoryTab} onValueChange={setCategoryTab} className="space-y-4">
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
        </Tabs>
      </div>
      
      {selectedLitter && (
        <div className="mt-6 animate-fade-in space-y-6">
          <div className="bg-greige-50 rounded-lg border border-greige-300 p-4">
            <SelectedLitterSection
              litter={selectedLitter}
              onUpdateLitter={handleUpdateLitter}
              onDeleteLitter={handleDeleteLitter}
              onArchiveLitter={handleArchiveLitter}
              onAddPuppy={handleAddPuppy}
              onUpdatePuppy={handleUpdatePuppy}
              onDeletePuppy={handleDeletePuppy}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default MyLittersContent;
