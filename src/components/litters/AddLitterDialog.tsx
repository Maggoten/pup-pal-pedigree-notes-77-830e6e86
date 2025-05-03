
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Litter, PlannedLitter } from '@/types/breeding';
import AddLitterDialogContent from './dialog/AddLitterDialogContent';

interface AddLitterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLitter: (litter: Litter) => void;
  plannedLitters?: PlannedLitter[];
}

const AddLitterDialog: React.FC<AddLitterDialogProps> = ({
  open,
  onOpenChange,
  onAddLitter,
  plannedLitters = []
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Litter</DialogTitle>
        </DialogHeader>
        <AddLitterDialogContent 
          onClose={handleClose}
          onLitterAdded={onAddLitter}
          plannedLitters={plannedLitters}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddLitterDialog;
