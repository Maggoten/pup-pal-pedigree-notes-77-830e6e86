
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
import { completePregnancy, deletePregnancy } from '@/services/PregnancyService';

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
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const success = await completePregnancy(pregnancyId);
      if (success) {
        toast({
          title: "Pregnancy Completed",
          description: `${femaleName}'s pregnancy has been marked as completed successfully.`,
        });
        onClose();
        navigate('/pregnancy');
      } else {
        toast({
          title: "Complete Failed",
          description: "There was a problem completing the pregnancy.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error completing pregnancy:", error);
      toast({
        title: "Complete Failed",
        description: "An unexpected error occurred while completing the pregnancy.",
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
              onClick={() => setIsCompleteConfirmOpen(true)}
              disabled={isProcessing}
            >
              <Archive className="h-4 w-4" />
              Complete Pregnancy
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

      <AlertDialog open={isCompleteConfirmOpen} onOpenChange={setIsCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Pregnancy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this pregnancy as completed? 
              <br /><br />
              Completed pregnancies will be removed from your active pregnancies list, 
              but can be retrieved later if needed. This will also free up the female dog 
              for a new pregnancy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleComplete}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary-hover"
            >
              {isProcessing ? "Completing..." : "Complete Pregnancy"}
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
