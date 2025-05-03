
import React, { memo, useMemo } from 'react';
import { Litter } from '@/types/breeding';
import LitterCard from './LitterCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface LitterGridViewProps {
  litters: Litter[];
  onSelectLitter: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
  selectedLitterId?: string | null;
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
  selectedLitterId
}) => {
  const isMobile = useIsMobile();
  
  // Only compute this when dependencies change
  const visibleLitters = useMemo(() => {
    // Implement windowing - only render what's initially visible
    const initialRenderCount = Math.min(12, litters.length);
    
    return litters.slice(0, initialRenderCount).map(litter => (
      <MemoizedLitterCard
        key={litter.id}
        litter={litter}
        onSelect={onSelectLitter}
        onArchive={onArchive}
        isSelected={selectedLitterId === litter.id}
      />
    ));
  }, [litters, selectedLitterId, onSelectLitter, onArchive]);
  
  // Determine if we need to show "load more" message
  const hasMore = litters.length > 12;
  
  return (
    <div className={`grid grid-cols-1 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 animate-fade-in`}>
      {visibleLitters}
      {hasMore && (
        <div className="col-span-full text-center py-2 text-sm text-muted-foreground">
          Showing 12 of {litters.length} litters. Scroll to load more.
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LitterGridView);
