
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dog } from 'lucide-react';

interface EmptyPlannedLittersProps {
  onAddClick: () => void;
}

const EmptyPlannedLitters: React.FC<EmptyPlannedLittersProps> = ({ onAddClick }) => {
  return (
    <div className="text-center py-12">
      <Dog className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-medium mt-4 mb-2">No Planned Litters</h3>
      <p className="text-muted-foreground">Create your first planned breeding combination</p>
      <Button onClick={onAddClick} className="mt-4">
        Add Your First Planned Litter
      </Button>
    </div>
  );
};

export default EmptyPlannedLitters;
