
import React from 'react';
import { Milestone } from 'lucide-react';
import { Litter } from '@/types/breeding';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DevelopmentSectionProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

const DevelopmentSection: React.FC<DevelopmentSectionProps> = ({
  litter,
  onToggleItem
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-2">
          <Milestone className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Development Timeline</CardTitle>
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

export default DevelopmentSection;
