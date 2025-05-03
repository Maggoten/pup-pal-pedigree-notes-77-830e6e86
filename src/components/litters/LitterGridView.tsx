
import React, { useMemo } from 'react';
import { Litter } from '@/types/breeding';
import LitterCard from './LitterCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface LitterGridViewProps {
  litters: Litter[];
  onSelectLitter: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
  selectedLitterId?: string | null;
}

const LitterGridView: React.FC<LitterGridViewProps> = ({ 
  litters, 
  onSelectLitter, 
  onArchive,
  selectedLitterId
}) => {
  const isMobile = useIsMobile();
  
  // Memoize the grid of LitterCards to prevent unnecessary re-renders
  const litterCards = useMemo(() => (
    litters.map(litter => (
      <LitterCard 
        key={litter.id}
        litter={litter} 
        onSelect={onSelectLitter}
        onArchive={onArchive}
        isSelected={selectedLitterId === litter.id}
      />
    ))
  ), [litters, selectedLitterId, onSelectLitter, onArchive]);
  
  return (
    <div className={`grid grid-cols-1 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 animate-fade-in`}>
      {litterCards}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(LitterGridView);
