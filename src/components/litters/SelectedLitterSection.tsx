import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import PuppiesTable from '../puppies/PuppiesTable';
import { Dog, Litter } from '@/types/dogs';
import { useDogs } from '@/context/DogsContext';
import { ArrowLeft } from 'lucide-react';

interface SelectedLitterSectionProps {
  litter: Litter;
  onBackClick: () => void;
}

const SelectedLitterSection = ({ litter, onBackClick }: SelectedLitterSectionProps) => {
  const { dogs } = useDogs();
  
  return (
    <div>
      <Button onClick={onBackClick} variant="ghost" className="flex items-center gap-2 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Litters
      </Button>
      
      <h2 className="text-2xl font-bold mb-4">{litter.name}</h2>
      
      {/* Add your litter details here */}
      
      <PuppiesTable litter={litter} />
    </div>
  );
};

export default SelectedLitterSection;
