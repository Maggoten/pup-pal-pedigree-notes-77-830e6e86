
import React from 'react';
import { Litter } from '@/types/breeding';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';
import { Card, CardContent } from '@/components/ui/card';

interface CompactDevelopmentSectionProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

const CompactDevelopmentSection: React.FC<CompactDevelopmentSectionProps> = ({
  litter,
  onToggleItem
}) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <PuppyDevelopmentChecklist 
          litter={litter} 
          onToggleItem={onToggleItem}
          compact={true}
        />
      </CardContent>
    </Card>
  );
};

export default CompactDevelopmentSection;
