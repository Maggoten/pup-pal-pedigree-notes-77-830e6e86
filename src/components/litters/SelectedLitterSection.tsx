
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { Litter, Puppy } from '@/types/breeding';
import LitterDetails from './LitterDetails';
import LitterEditDialog from './LitterEditDialog';

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
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  
  if (!selectedLitter) return null;

  return (
    <div className="mt-10">
      <div className="flex justify-end items-center mb-4">
        <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Litter Details
            </Button>
          </DialogTrigger>
          <LitterEditDialog 
            litter={selectedLitter}
            onClose={() => setShowEditLitterDialog(false)}
            onUpdate={onUpdateLitter}
            onDelete={onDeleteLitter}
            onArchive={onArchiveLitter}
          />
        </Dialog>
      </div>
      
      <LitterDetails
        litter={selectedLitter}
        onAddPuppy={onAddPuppy}
        onUpdatePuppy={onUpdatePuppy}
        onDeletePuppy={onDeletePuppy}
      />
    </div>
  );
};

export default SelectedLitterSection;
