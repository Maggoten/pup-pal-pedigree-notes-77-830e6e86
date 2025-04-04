
import React from 'react';
import { Litter } from '@/types/breeding';
import LitterCard from './LitterCard';

interface LitterGridViewProps {
  litters: Litter[];
  onSelect: (litter: Litter) => void;
  onArchive: (litter: Litter) => void;
}

const LitterGridView: React.FC<LitterGridViewProps> = ({
  litters,
  onSelect,
  onArchive,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {litters.map(litter => (
        <LitterCard 
          key={litter.id}
          litter={litter}
          onSelect={onSelect}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
};

export default LitterGridView;
