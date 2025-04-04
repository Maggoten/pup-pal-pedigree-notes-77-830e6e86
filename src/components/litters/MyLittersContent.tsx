
import React from 'react';
import { Dog } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { 
  Tabs, 
  TabsContent, 
  CategoryTabsList, 
  CategoryTabsTrigger 
} from '@/components/ui/tabs';
import { useLitterFilters } from './LitterFilterProvider';
import { useLitterManagement } from '@/hooks/useLitterManagement';
import LitterFilterControls from './LitterFilterControls';
import LitterTabContent from './LitterTabContent';
import SelectedLitterSection from './SelectedLitterSection';
import useLitterFiltering from '@/hooks/useLitterFiltering';

const ITEMS_PER_PAGE = 12;

const MyLittersContent: React.FC = () => {
  const {
    activeLitters,
    archivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    plannedLitters,
    showAddLitterDialog,
    setShowAddLitterDialog,
    selectedLitter,
    handleAddLitter,
    handleUpdateLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleDeleteLitter,
    handleArchiveLitter,
    handleSelectLitter,
    getAvailableYears
  } = useLitterManagement();
  
  // Get filter state from context
  const { 
    searchQuery, 
    filterYear, 
    categoryTab, 
    setCategoryTab,
    activePage,
    setActivePage,
    archivedPage,
    setArchivedPage
  } = useLitterFilters();
  
  // Filter and paginate litters
  const {
    filteredLitters: filteredActiveLitters,
    paginatedLitters: paginateActiveLitters,
    pageCount: activePageCount
  } = useLitterFiltering(activeLitters, searchQuery, filterYear, activePage, ITEMS_PER_PAGE);
  
  const {
    filteredLitters: filteredArchivedLitters,
    paginatedLitters: paginateArchivedLitters,
    pageCount: archivedPageCount
  } = useLitterFiltering(archivedLitters, searchQuery, filterYear, archivedPage, ITEMS_PER_PAGE);
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<Dog className="h-6 w-6" />}
    >
      <Tabs value={categoryTab} onValueChange={setCategoryTab} className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <CategoryTabsList>
            <CategoryTabsTrigger value="active" className="relative">
              Active Litters
              {activeLitters.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
                  {activeLitters.length}
                </span>
              )}
            </CategoryTabsTrigger>
            <CategoryTabsTrigger value="archived" className="relative">
              Archived Litters
              {archivedLitters.length > 0 && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
                  {archivedLitters.length}
                </span>
              )}
            </CategoryTabsTrigger>
          </CategoryTabsList>
          
          <LitterFilterControls
            showAddLitterDialog={showAddLitterDialog}
            setShowAddLitterDialog={setShowAddLitterDialog}
            onAddLitter={handleAddLitter}
            plannedLitters={plannedLitters}
            availableYears={getAvailableYears()}
          />
        </div>
        
        <TabsContent value="active" className="space-y-6">
          <LitterTabContent
            litters={activeLitters}
            filteredLitters={filteredActiveLitters}
            paginatedLitters={paginateActiveLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onSelectLitterId={setSelectedLitterId}
            onArchive={(litter) => handleArchiveLitter(litter.id, true)}
            onAddLitter={() => setShowAddLitterDialog(true)}
            pageCount={activePageCount}
            currentPage={activePage}
            setCurrentPage={setActivePage}
            isArchived={false}
            searchQuery={searchQuery}
            filterYear={filterYear}
          />
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6">
          <LitterTabContent
            litters={archivedLitters}
            filteredLitters={filteredArchivedLitters}
            paginatedLitters={paginateArchivedLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onSelectLitterId={setSelectedLitterId}
            onArchive={(litter) => handleArchiveLitter(litter.id, false)}
            onAddLitter={() => setShowAddLitterDialog(true)}
            pageCount={archivedPageCount}
            currentPage={archivedPage}
            setCurrentPage={setArchivedPage}
            isArchived={true}
            searchQuery={searchQuery}
            filterYear={filterYear}
          />
        </TabsContent>
      </Tabs>
      
      <SelectedLitterSection
        selectedLitter={selectedLitter}
        onUpdateLitter={handleUpdateLitter}
        onDeleteLitter={handleDeleteLitter}
        onArchiveLitter={handleArchiveLitter}
        onAddPuppy={handleAddPuppy}
        onUpdatePuppy={handleUpdatePuppy}
        onDeletePuppy={handleDeletePuppy}
      />
    </PageLayout>
  );
};

export default MyLittersContent;
