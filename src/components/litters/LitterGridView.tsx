
import React from 'react';
import { Litter } from '@/types/breeding';
import LitterCard from './LitterCard';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
