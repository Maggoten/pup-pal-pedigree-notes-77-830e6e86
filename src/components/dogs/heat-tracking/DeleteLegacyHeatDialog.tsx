import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';

interface DeleteLegacyHeatDialogProps {
  dogId: string;
  heatIndex: number;
  heatDate: string;
  onSuccess: () => void;
}

export const DeleteLegacyHeatDialog: React.FC<DeleteLegacyHeatDialogProps> = ({
  dogId,
  heatIndex,
  heatDate,
  onSuccess
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await HeatService.deleteHeatEntry(dogId, heatIndex);
      
      if (success) {
        toast({
          title: "Heat entry deleted",
          description: "The heat entry has been successfully removed."
        });
        onSuccess();
        setOpen(false);
      } else {
        throw new Error('Failed to delete heat entry');
      }
    } catch (error) {
      console.error('Error deleting heat entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete heat entry';
      
      toast({
        title: "Unable to delete heat entry",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = format(parseISO(heatDate), 'MMMM dd, yyyy');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Heat Entry</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the heat entry from{' '}
            <span className="font-medium text-foreground">{formattedDate}</span>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};