
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
import { archivePregnancy, deletePregnancy } from '@/services/PregnancyService';

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
  const navigate = useNavigate();
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      const success = await archivePregnancy(pregnancyId);
      if (success) {
        toast({
          title: "Pregnancy Archived",
          description: `${femaleName}'s pregnancy has been archived successfully.`,
        });
        onClose();
        navigate('/pregnancy');
      } else {
        toast({
          title: "Archive Failed",
          description: "There was a problem archiving the pregnancy.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error archiving pregnancy:", error);
      toast({
        title: "Archive Failed",
        description: "An unexpected error occurred while archiving the pregnancy.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setIsArchiveConfirmOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const success = await deletePregnancy(pregnancyId);
      if (success) {
        toast({
          title: "Pregnancy Deleted",
          description: `${femaleName}'s pregnancy has been permanently deleted.`,
        });
        onClose();
        navigate('/pregnancy');
      } else {
        toast({
          title: "Delete Failed",
          description: "There was a problem deleting the pregnancy.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting pregnancy:", error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred while deleting the pregnancy.",
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
            <DialogTitle>Manage Pregnancy</DialogTitle>
            <DialogDescription>
              What would you like to do with {femaleName}'s pregnancy?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-2"
              onClick={() => setIsArchiveConfirmOpen(true)}
              disabled={isProcessing}
            >
              <Archive className="h-4 w-4" />
              Archive Pregnancy
            </Button>
            <Button 
              variant="destructive" 
              className="flex items-center justify-start gap-2"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isProcessing}
            >
              <Trash className="h-4 w-4" />
              Delete Pregnancy
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Pregnancy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this pregnancy? 
              <br /><br />
              Archived pregnancies will be removed from your active pregnancies list, 
              but can be retrieved later if needed. This will also free up the female dog 
              for a new pregnancy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchive}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary-hover"
            >
              {isProcessing ? "Archiving..." : "Archive Pregnancy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pregnancy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pregnancy? This action cannot be undone
              and all pregnancy data including temperature logs and symptom records will be 
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManagePregnancyDialog;
