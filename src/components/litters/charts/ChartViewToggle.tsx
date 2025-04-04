
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartViewToggleProps {
  viewMode: 'single' | 'litter';
  setViewMode: (mode: 'single' | 'litter') => void;
  selectedPuppyExists: boolean;
}

const ChartViewToggle: React.FC<ChartViewToggleProps> = ({
  viewMode,
  setViewMode,
  selectedPuppyExists
}) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button 
        variant={viewMode === 'single' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setViewMode('single')}
        disabled={!selectedPuppyExists}
      >
        Individual
      </Button>
      <Button 
        variant={viewMode === 'litter' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setViewMode('litter')}
      >
        <Users className="h-4 w-4 mr-1" />
        Whole Litter
      </Button>
    </div>
  );
};

export default ChartViewToggle;
