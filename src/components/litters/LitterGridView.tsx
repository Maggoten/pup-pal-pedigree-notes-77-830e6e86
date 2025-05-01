
import React from 'react';
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
  
  return (
    <div 
      className={`grid grid-cols-1 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}
      style={{ 
        minHeight: litters.length > 0 ? '500px' : '200px',
        // Ensure stable layout with a consistent width
        width: '100%',
        // Prevent content shifting during animations
        willChange: 'contents',
        // Apply containment to prevent layout shifts from bubbling up
        contain: 'layout size',
      }}
    >
      {litters.map(litter => (
        <LitterCard 
          key={litter.id}
          litter={litter} 
          onSelect={onSelectLitter}
          onArchive={onArchive}
          isSelected={selectedLitterId === litter.id}
        />
      ))}
    </div>
  );
};

export default LitterGridView;
