
import React from 'react';
import AddLitterDialogContent from './dialog/AddLitterDialogContent';
import { Litter, PlannedLitter } from '@/types/breeding';

interface AddLitterDialogProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
  plannedLitters: PlannedLitter[];
}

const AddLitterDialog: React.FC<AddLitterDialogProps> = (props) => {
  return <AddLitterDialogContent {...props} />;
};

export default AddLitterDialog;
