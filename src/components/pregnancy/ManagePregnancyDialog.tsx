
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Archive, Trash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { completePregnancy, deletePregnancy, getFirstActivePregnancy } from '@/services/PregnancyService';
import { useTranslation } from 'react-i18next';

interface ManagePregnancyDialogProps {
  pregnancyId: string;
  femaleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const ManagePregnancyDialog: React.FC<ManagePregnancyDialogProps> = ({
  pregnancyId,
  femaleName,
  open,
  onOpenChange,
  onClose,
}) => {
  const { t } = useTranslation('pregnancy');
  const navigate = useNavigate();
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const success = await completePregnancy(pregnancyId);
      if (success) {
        toast({
          title: t('toasts.success.pregnancyCompleted'),
          description: t('toasts.success.pregnancyUpdated'),
        });
        onClose();
        
        // Smart navigation: Check if there are other active pregnancies
        const firstActiveId = await getFirstActivePregnancy();
        
        if (firstActiveId) {
          // Navigate to first active pregnancy if exists
          navigate(`/pregnancy/${firstActiveId}`);
        } else {
          // Navigate to main pregnancy page if no active pregnancies
          navigate('/pregnancy');
        }
      } else {
        toast({
          title: t('toasts.error.failedToCompletePregnancy'),
          description: t('toasts.error.failedToCompletePregnancy'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error completing pregnancy:", error);
      toast({
        title: t('toasts.error.failedToCompletePregnancy'),
        description: t('toasts.error.failedToCompletePregnancy'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setIsCompleteConfirmOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const success = await deletePregnancy(pregnancyId);
      if (success) {
        toast({
          title: t('toasts.success.pregnancyDeleted'),
          description: t('toasts.success.pregnancyDeleted'),
        });
        onClose();
        
        // Smart navigation: Check if there are other active pregnancies
        const firstActiveId = await getFirstActivePregnancy();
        
        if (firstActiveId) {
          // Navigate to first active pregnancy if exists
          navigate(`/pregnancy/${firstActiveId}`);
        } else {
          // Navigate to main pregnancy page if no active pregnancies
          navigate('/pregnancy');
        }
      } else {
        toast({
          title: t('toasts.error.failedToDeletePregnancy'),
          description: t('toasts.error.failedToDeletePregnancy'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting pregnancy:", error);
      toast({
        title: t('toasts.error.failedToDeletePregnancy'),
        description: t('toasts.error.failedToDeletePregnancy'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('management.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('management.dialog.description', { femaleName })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-2"
              onClick={() => setIsCompleteConfirmOpen(true)}
              disabled={isProcessing}
            >
              <Archive className="h-4 w-4" />
              {t('management.dialog.actions.complete')}
            </Button>
            <Button 
              variant="destructive" 
              className="flex items-center justify-start gap-2"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isProcessing}
            >
              <Trash className="h-4 w-4" />
              {t('management.dialog.actions.delete')}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              {t('management.dialog.actions.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isCompleteConfirmOpen} onOpenChange={setIsCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('management.dialog.complete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('management.dialog.complete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('management.dialog.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleComplete}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary-hover"
            >
              {isProcessing ? t('management.dialog.complete.processing') : t('management.dialog.complete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('management.dialog.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('management.dialog.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('management.dialog.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? t('management.dialog.delete.processing') : t('management.dialog.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManagePregnancyDialog;
