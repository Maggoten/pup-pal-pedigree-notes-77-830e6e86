import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Litter } from '@/types/breeding';
import AddLitterDialogContent from './dialog/AddLitterDialogContent';
import { useTranslation } from 'react-i18next';

interface AddLitterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLitter: (litter: Litter) => void;
}

const AddLitterDialog: React.FC<AddLitterDialogProps> = ({
  open,
  onOpenChange,
  onAddLitter
}) => {
  const { t } = useTranslation('litters');
  
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('actions.addNewLitter')}</DialogTitle>
        </DialogHeader>
        <AddLitterDialogContent 
          onClose={handleClose}
          onLitterAdded={onAddLitter}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddLitterDialog;
