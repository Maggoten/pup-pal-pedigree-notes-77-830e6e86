
import React from 'react';
import { useLitterFilters } from './LitterFilterProvider';
import LitterGridView from './LitterGridView';
import LitterListView from './LitterListView';
import LitterPagination from './LitterPagination';
import EmptyLitterState from './EmptyLitterState';
import { Litter } from '@/types/breeding';

interface LitterTabContentProps {
  litters: Litter[];
  filteredLitters: Litter[];
  selectedLitterId: string | null;
  onSelectLitter: (litter: Litter) => void;
  onSelectLitterId: (litterId: string) => void;
  onArchive: (litter: Litter, archive: boolean) => void;
  onAddLitter: () => void;
  paginatedLitters: Litter[];
  pageCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isArchived: boolean;
  searchQuery: string;
  filterYear: number | null;
}

const LitterTabContent: React.FC<LitterTabContentProps> = ({
  litters,
  filteredLitters,
  paginatedLitters,
  selectedLitterId,
  onSelectLitter,
  onSelectLitterId,
  onArchive,
  onAddLitter,
  pageCount,
  currentPage,
  setCurrentPage,
  isArchived,
  searchQuery,
  filterYear
}) => {
  const { view } = useLitterFilters();

  if (filteredLitters.length > 0) {
    return (
      <>
        {view === 'grid' ? (
          <LitterGridView 
            litters={paginatedLitters}
            onSelect={onSelectLitter}
            onArchive={(litter) => onArchive(litter, !isArchived)}
          />
        ) : (
          <LitterListView 
            litters={paginatedLitters}
            selectedLitterId={selectedLitterId}
            onLitterSelect={onSelectLitterId}
          />
        )}
        
        <LitterPagination 
          currentPage={currentPage}
          totalPages={pageCount}
          onPageChange={setCurrentPage}
        />
      </>
    );
  } 
  
  if (searchQuery || filterYear) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">
          No matching {isArchived ? "archived " : ""}litters found
        </h3>
        <p className="text-muted-foreground">Try adjusting your search or filter</p>
      </div>
    );
  } 
  
  if (!isArchived) {
    return <EmptyLitterState onAddLitter={onAddLitter} />;
  }
  
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium mb-2">No archived litters</h3>
      <p className="text-muted-foreground">
        You can archive litters you no longer actively work with
      </p>
    </div>
  );
};

export default LitterTabContent;
