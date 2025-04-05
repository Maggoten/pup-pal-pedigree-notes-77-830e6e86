
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Puppy } from '@/types/breeding';

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
    }
  };

  return (
    <div className="flex gap-2 justify-end items-center">
      <div className="flex items-center gap-2">
        {viewMode === 'single' && (
          <div className="w-[180px]">
            <Select
              value={selectedPuppy?.id || ""}
              onValueChange={handlePuppySelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select puppy" />
              </SelectTrigger>
              <SelectContent>
                {puppies.map(puppy => (
                  <SelectItem key={puppy.id} value={puppy.id}>
                    {puppy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button 
          variant={viewMode === 'single' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => {
            if (selectedPuppyExists) {
              setViewMode('single');
            }
          }}
          disabled={!selectedPuppyExists}
        >
          Individual
        </Button>
      </div>
      
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
