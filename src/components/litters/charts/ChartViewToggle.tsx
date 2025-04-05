
import React from 'react';
import { Puppy } from '@/types/breeding';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface ChartViewToggleProps {
  viewMode: 'single' | 'litter';
  setViewMode: (mode: 'single' | 'litter') => void;
  selectedPuppyExists: boolean;
  puppies: Puppy[];
  selectedPuppy: Puppy | null;
  onSelectPuppy: (puppy: Puppy) => void;
}

const ChartViewToggle: React.FC<ChartViewToggleProps> = ({
  viewMode,
  setViewMode,
  selectedPuppyExists,
  puppies,
  selectedPuppy,
  onSelectPuppy
}) => {
  // Handle puppy selection from dropdown
  const handlePuppySelect = (puppyId: string) => {
    const puppy = puppies.find(p => p.id === puppyId);
    if (puppy) {
      onSelectPuppy(puppy);
      setViewMode('single');
    } else {
      // If no puppy is selected, switch to litter view
      setViewMode('litter');
    }
  };

  return (
    <div className="flex gap-2 justify-end items-center">
      <div className="w-[180px]">
        <Select
          value={selectedPuppy?.id || ""}
          onValueChange={handlePuppySelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select puppy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Whole Litter</SelectItem>
            {puppies.map(puppy => (
              <SelectItem key={puppy.id} value={puppy.id}>
                {puppy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ChartViewToggle;
