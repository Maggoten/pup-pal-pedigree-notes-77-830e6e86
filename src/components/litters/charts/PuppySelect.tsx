
import React from 'react';
import { Puppy } from '@/types/breeding';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PuppySelectProps } from './types';

const PuppySelect: React.FC<PuppySelectProps> = ({ 
  puppies, 
  selectedPuppy, 
  onSelectPuppy 
}) => {
  if (puppies.length === 0) {
    return null;
  }

  const handleSelectChange = (value: string) => {
    if (value === "all") {
      onSelectPuppy(null);
    } else {
      const puppy = puppies.find(p => p.id === value);
      if (puppy) {
        onSelectPuppy(puppy);
      }
    }
  };

  return (
    <Select 
      value={selectedPuppy?.id || "all"} 
      onValueChange={handleSelectChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select puppy" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Puppies</SelectItem>
        {puppies.map(puppy => (
          <SelectItem key={puppy.id} value={puppy.id}>
            {puppy.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PuppySelect;
