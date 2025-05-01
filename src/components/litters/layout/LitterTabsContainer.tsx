
import React from 'react';
import { 
  Tabs, 
  TabsContent, 
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import LitterFilterHeader from '../filters/LitterFilterHeader';
import LitterTabContent from '../tabs/LitterTabContent';
import { Litter } from '@/types/breeding';

interface LitterTabsContainerProps {
  isLoading: boolean;
  activeLitters: Litter[];
  archivedLitters: Litter[];
  categoryTab: string;
  setCategoryTab: (value: string) => void;
  showAddLitterDialog: boolean;
  setShowAddLitterDialog: (show: boolean) => void;
  onAddLitter: (litter: Litter) => void;
  plannedLitters: any[];
  getAvailableYears: () => number[];
  filteredActiveLitters: Litter[];
  paginatedActiveLitters: Litter[];
  filteredArchivedLitters: Litter[];
  paginatedArchivedLitters: Litter[];
  selectedLitterId: string | null;
  onSelectLitter: (litter: Litter) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  isFilterActive: boolean;
  onClearFilter: () => void;
  activePageCount: number;
  activePage: number;
  setActivePage: (page: number) => void;
  archivedPageCount: number;
  archivedPage: number;
  setArchivedPage: (page: number) => void;
}

const LitterTabsContainer: React.FC<LitterTabsContainerProps> = ({
  isLoading,
  activeLitters,
  archivedLitters,
  categoryTab,
  setCategoryTab,
  showAddLitterDialog,
  setShowAddLitterDialog,
  onAddLitter,
  plannedLitters,
  getAvailableYears,
  filteredActiveLitters,
  paginatedActiveLitters,
  filteredArchivedLitters,
  paginatedArchivedLitters,
  selectedLitterId,
  onSelectLitter,
  onArchiveLitter,
  isFilterActive,
  onClearFilter,
  activePageCount,
  activePage,
  setActivePage,
  archivedPageCount,
  archivedPage,
  setArchivedPage
}) => {
  const handleAddLitterClick = () => {
    setShowAddLitterDialog(true);
  };
  
  const handleArchiveLitter = (litter: Litter) => {
    onArchiveLitter(litter.id, !litter.archived);
  };

  if (isLoading) {
    return (
      <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 pb-6 min-h-[600px] stable-layout">
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
      </div>
    );
  }

  return (
    <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 pb-6 min-h-[600px] stable-layout">
      <Tabs 
        value={categoryTab} 
        onValueChange={setCategoryTab} 
        className="space-y-4" 
        defaultValue={categoryTab}
      >
        <LitterFilterHeader 
          activeLitters={activeLitters}
          archivedLitters={archivedLitters}
          categoryTab={categoryTab}
          setCategoryTab={setCategoryTab}
          showAddLitterDialog={showAddLitterDialog}
          setShowAddLitterDialog={setShowAddLitterDialog}
          onAddLitter={onAddLitter}
          plannedLitters={plannedLitters}
          availableYears={getAvailableYears()}
        />
        
        <TabsContent value="active" className="space-y-6 min-h-[400px] stable-layout">
          <LitterTabContent
            litters={activeLitters}
            filteredLitters={filteredActiveLitters}
            paginatedLitters={paginatedActiveLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={onSelectLitter}
            onAddLitter={handleAddLitterClick}
            onArchive={handleArchiveLitter}
            pageCount={activePageCount}
            currentPage={activePage}
            onPageChange={setActivePage}
            isFilterActive={isFilterActive}
            onClearFilter={onClearFilter}
          />
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6 min-h-[400px] stable-layout">
          <LitterTabContent
            litters={archivedLitters}
            filteredLitters={filteredArchivedLitters}
            paginatedLitters={paginatedArchivedLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={onSelectLitter}
            onAddLitter={handleAddLitterClick}
            onArchive={handleArchiveLitter}
            pageCount={archivedPageCount}
            currentPage={archivedPage}
            onPageChange={setArchivedPage}
            isFilterActive={isFilterActive}
            onClearFilter={onClearFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LitterTabsContainer;
