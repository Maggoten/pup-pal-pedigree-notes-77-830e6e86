
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import PuppiesTable from '../puppies/PuppiesTable';
import { Litter, Puppy } from '@/types/breeding';
import { useDogsContext } from '@/hooks/useDogsContext';
import { ArrowLeft } from 'lucide-react';

interface SelectedLitterSectionProps {
  litter: Litter;
  onBackClick: () => void;
  onUpdateLitter?: (updatedLitter: Litter) => Promise<void>;
  onDeleteLitter?: (litterId: string) => Promise<void>;
  onArchiveLitter?: (litterId: string, archive: boolean) => Promise<void>;
  onAddPuppy?: (newPuppy: Puppy) => Promise<void>;
  onUpdatePuppy?: (updatedPuppy: Puppy) => Promise<void>;
  onDeletePuppy?: (puppyId: string) => Promise<void>;
}

const SelectedLitterSection = ({ 
  litter, 
  onBackClick,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy 
}: SelectedLitterSectionProps) => {
  const { dogs } = useDogsContext();
  
  return (
    <div>
      <Button onClick={onBackClick} variant="ghost" className="flex items-center gap-2 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Litters
      </Button>
      
      <h2 className="text-2xl font-bold mb-4">{litter.name}</h2>
      
      {/* Add your litter details here */}
      
      <PuppiesTable puppies={litter.puppies} />
    </div>
  );
};

export default SelectedLitterSection;
