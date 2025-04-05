
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
import LitterGridView from './LitterGridView';
import EmptyLitterState from './EmptyLitterState';
import LitterPagination from './LitterPagination';
import SelectedLitterSection from './SelectedLitterSection';
import useLitterFiltering from '@/hooks/useLitterFiltering';
import { Button } from '@/components/ui/button';

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
  
  // Handle creating a new litter
  const handleAddLitterClick = () => {
    setShowAddLitterDialog(true);
  };

  // Handle filtered empty state
  const renderEmptyState = (filterApplied: boolean, litters: any[], onClearFilter: () => void) => {
    if (litters.length === 0) {
      return <EmptyLitterState onAddLitter={handleAddLitterClick} />;
    }
    
    if (filterApplied) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">No litters found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={onClearFilter}>Clear Filters</Button>
        </div>
      );
    }
    
    return null;
  };
  
  const isFilterActive = !!searchQuery || !!filterYear;
  
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
          {renderEmptyState(isFilterActive, activeLitters, () => {
            setFilterYear(null);
            setSearchQuery('');
          })}
          
          {activeLitters.length > 0 && filteredActiveLitters.length > 0 && (
            <>
              <LitterGridView
                litters={paginateActiveLitters}
                onSelectLitter={handleSelectLitter}
                onArchive={(litter) => handleArchiveLitter(litter.id, true)}
                selectedLitterId={selectedLitterId}
              />
              
              <LitterPagination
                pageCount={activePageCount}
                currentPage={activePage}
                onPageChange={setActivePage}
              />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6">
          {renderEmptyState(isFilterActive, archivedLitters, () => {
            setFilterYear(null);
            setSearchQuery('');
          })}
          
          {archivedLitters.length > 0 && filteredArchivedLitters.length > 0 && (
            <>
              <LitterGridView
                litters={paginateArchivedLitters}
                onSelectLitter={handleSelectLitter}
                onArchive={(litter) => handleArchiveLitter(litter.id, false)}
                selectedLitterId={selectedLitterId}
              />
              
              <LitterPagination
                pageCount={archivedPageCount}
                currentPage={archivedPage}
                onPageChange={setArchivedPage}
              />
            </>
          )}
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
