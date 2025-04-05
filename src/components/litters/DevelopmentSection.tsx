
import React from 'react';
import { CheckSquare } from 'lucide-react';
import { Litter } from '@/types/breeding';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';

interface DevelopmentSectionProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

const DevelopmentSection: React.FC<DevelopmentSectionProps> = ({
  litter,
  onToggleItem
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Development</h3>
      </div>
      
      <PuppyDevelopmentChecklist 
        litter={litter} 
        onToggleItem={onToggleItem}
        compact={false}
      />
    </div>
  );
};

export default DevelopmentSection;
