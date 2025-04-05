
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
    if (puppyId === "litter") {
      // If "Whole Litter" is selected, clear selected puppy and switch to litter view
      setViewMode('litter');
    } else {
      const puppy = puppies.find(p => p.id === puppyId);
      if (puppy) {
        onSelectPuppy(puppy);
        setViewMode('single');
      }
    }
  };

  return (
    <div className="flex gap-2 justify-end items-center">
      <div className="w-[180px]">
        <Select
          value={selectedPuppy?.id || "litter"}
          onValueChange={handlePuppySelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select puppy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="litter">Whole Litter</SelectItem>
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
