
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Litter } from '@/types/breeding';
import LitterGridView from '../LitterGridView';
import EmptyLitterState from '../EmptyLitterState';
import LitterPagination from '../LitterPagination';
import { useVirtualization } from '@/hooks/litters/operations/useVirtualization';
import { useLitterFilter } from '../LitterFilterProvider';

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

// Create a memoized Empty Filter State component
const EmptyFilterState = memo(({ onClearFilter }: { onClearFilter: () => void }) => (
  <div className="text-center py-10">
    <h3 className="text-lg font-medium mb-2">No litters found</h3>
    <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
    <Button variant="outline" onClick={onClearFilter}>Clear Filters</Button>
  </div>
));

EmptyFilterState.displayName = 'EmptyFilterState';

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
  const { statusFilter } = useLitterFilter();
  
  // Use virtualization hook for optimized rendering
  const { visibleLitters, hasMore, loadingMore, loadMore } = useVirtualization(paginatedLitters);
  
  // Render empty state for no litters
  if (litters.length === 0) {
    return <EmptyLitterState onAddLitter={onAddLitter} />;
  }
  
  // Render empty state for filtered results
  if (filteredLitters.length === 0 && isFilterActive) {
    return <EmptyFilterState onClearFilter={onClearFilter} />;
  }
  
  // No need to render anything if there are no filtered litters
  if (filteredLitters.length === 0) {
    return null;
  }
  
  return (
    <>
      <LitterGridView
        litters={visibleLitters}
        onSelectLitter={onSelectLitter}
        onArchive={onArchive}
        selectedLitterId={selectedLitterId}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
      
      {pageCount > 1 && (
        <LitterPagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LitterTabContent);
