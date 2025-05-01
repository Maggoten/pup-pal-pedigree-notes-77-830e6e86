
import React from 'react';
import { Litter, Puppy } from '@/types/breeding';
import { Skeleton } from '@/components/ui/skeleton';
import SelectedLitterSection from '../SelectedLitterSection';

interface ActiveLitterDisplayProps {
  isLoading: boolean;
  selectedLitter: Litter | null;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const ActiveLitterDisplay: React.FC<ActiveLitterDisplayProps> = ({ 
  isLoading,
  selectedLitter,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy
}) => {
  if (!selectedLitter) {
    return null;
  }

  return (
    <div className="mt-6 stable-layout">
      <div className="bg-greige-50 rounded-lg border border-greige-300 p-4 min-h-[300px] transform-gpu">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : (
          <SelectedLitterSection
            selectedLitter={selectedLitter}
            onUpdateLitter={onUpdateLitter}
            onDeleteLitter={onDeleteLitter}
            onArchiveLitter={onArchiveLitter}
            onAddPuppy={onAddPuppy}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
          />
        )}
      </div>
    </div>
  );
};

export default ActiveLitterDisplay;
