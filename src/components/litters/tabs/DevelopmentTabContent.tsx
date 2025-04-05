
import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Litter } from '@/types/breeding';
import PuppyDevelopmentChecklist from '../PuppyDevelopmentChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DevelopmentTabContentProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

const DevelopmentTabContent: React.FC<DevelopmentTabContentProps> = ({
  litter,
  onToggleItem
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Puppy Development Checklist</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <PuppyDevelopmentChecklist 
          litter={litter} 
          onToggleItem={onToggleItem}
          compact={false}
        />
      </CardContent>
    </Card>
  );
};

export default DevelopmentTabContent;
