
import React from 'react';
import { Button } from '@/components/ui/button';
import { Litter } from '@/types/breeding';
import LitterGridView from '../LitterGridView';
import EmptyLitterState from '../EmptyLitterState';
import LitterPagination from '../LitterPagination';

interface LitterTabContentProps {
  litters: Litter[];
  filteredLitters: Litter[];
  paginatedLitters: Litter[];
  selectedLitterId: string | null;
  onSelectLitter: (litter: Litter) => void;
  onAddLitter: () => void;
  onArchive: (litter: Litter) => void;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isFilterActive: boolean;
  onClearFilter: () => void;
}

const LitterTabContent: React.FC<LitterTabContentProps> = ({
  litters,
  filteredLitters,
  paginatedLitters,
  selectedLitterId,
  onSelectLitter,
  onAddLitter,
  onArchive,
  pageCount,
  currentPage,
  onPageChange,
  isFilterActive,
  onClearFilter
}) => {
  // Render empty state for no litters or when filtered results are empty
  if (litters.length === 0) {
    return <EmptyLitterState onAddLitter={onAddLitter} />;
  }
  
  if (filteredLitters.length === 0 && isFilterActive) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No litters found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
        <Button variant="outline" onClick={onClearFilter}>Clear Filters</Button>
      </div>
    );
  }
  
  return (
    <>
      {filteredLitters.length > 0 && (
        <>
          <LitterGridView
            litters={paginatedLitters}
            onSelectLitter={onSelectLitter}
            onArchive={onArchive}
            selectedLitterId={selectedLitterId}
          />
          
          <LitterPagination
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </>
      )}
    </>
  );
};

export default LitterTabContent;
