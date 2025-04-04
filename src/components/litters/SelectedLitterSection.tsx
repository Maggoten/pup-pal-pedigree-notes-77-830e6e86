
import React from 'react';
import { Litter, Puppy } from '@/types/breeding';
import LitterDetails from './LitterDetails';

interface SelectedLitterSectionProps {
  selectedLitter: Litter | null;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const SelectedLitterSection: React.FC<SelectedLitterSectionProps> = ({
  selectedLitter,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy
}) => {
  if (!selectedLitter) return null;

  return (
    <div className="mt-10">
      <LitterDetails
        litter={selectedLitter}
        onAddPuppy={onAddPuppy}
        onUpdatePuppy={onUpdatePuppy}
        onDeletePuppy={onDeletePuppy}
        onUpdateLitter={onUpdateLitter}
        onDeleteLitter={onDeleteLitter}
        onArchiveLitter={onArchiveLitter}
      />
    </div>
  );
};

export default SelectedLitterSection;
