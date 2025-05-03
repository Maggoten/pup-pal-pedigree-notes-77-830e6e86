
import React, { memo, useMemo } from 'react';
import { Litter } from '@/types/breeding';
import LitterCard from './LitterCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import { useVirtualWindow } from '@/hooks/litters/operations/useVirtualWindow';

interface LitterGridViewProps {
  litters: Litter[];
  onSelectLitter: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
  selectedLitterId?: string | null;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

// Extract LitterCard as a memoized component to avoid re-rendering all cards
const MemoizedLitterCard = memo(({ 
  litter, 
  onSelect, 
  onArchive, 
  isSelected 
}: { 
  litter: Litter; 
  onSelect: (litter: Litter) => void; 
  onArchive?: (litter: Litter) => void;
  isSelected: boolean;
}) => (
  <LitterCard 
    key={litter.id}
    litter={litter} 
    onSelect={onSelect}
    onArchive={onArchive}
    isSelected={isSelected}
  />
));

MemoizedLitterCard.displayName = 'MemoizedLitterCard';

const LitterGridView: React.FC<LitterGridViewProps> = ({ 
  litters, 
  onSelectLitter, 
  onArchive,
  selectedLitterId,
  hasMore,
  loadingMore,
  onLoadMore
}) => {
  const isMobile = useIsMobile();
  
  // Use the optimized virtualization hook
  const { visibleLitters, loadMore } = useVirtualWindow(litters);
  
  // Only compute this when dependencies change
  const renderedLitters = useMemo(() => {
    console.log(`Rendering ${visibleLitters.length} litters in grid view`);
    return visibleLitters.map(litter => (
      <MemoizedLitterCard
        key={litter.id}
        litter={litter}
        onSelect={onSelectLitter}
        onArchive={onArchive}
        isSelected={selectedLitterId === litter.id}
      />
    ));
  }, [visibleLitters, selectedLitterId, onSelectLitter, onArchive]);
  
  // Handle scrolling for virtualization
  const handleLoadMoreClick = () => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      loadMore();
    }
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {renderedLitters}
      </div>
      
      {hasMore && (
        <div 
          className="col-span-full text-center py-4 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={handleLoadMoreClick}
        >
          {loadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more litters...</span>
            </div>
          ) : (
            <span>Show more litters (showing {litters.length} of total)</span>
          )}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LitterGridView);
