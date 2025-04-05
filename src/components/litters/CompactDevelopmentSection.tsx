
import React from 'react';
import { Litter } from '@/types/breeding';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';

interface CompactDevelopmentSectionProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

const CompactDevelopmentSection: React.FC<CompactDevelopmentSectionProps> = ({
  litter,
  onToggleItem
}) => {
  return (
    <PuppyDevelopmentChecklist 
      litter={litter} 
      onToggleItem={onToggleItem}
      compact={true}
    />
  );
};

export default CompactDevelopmentSection;
