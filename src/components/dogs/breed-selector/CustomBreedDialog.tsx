
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomBreedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breedName: string;
  onBreedNameChange: (value: string) => void;
  onSubmit: () => void;
}

const CustomBreedDialog: React.FC<CustomBreedDialogProps> = ({
  open,
  onOpenChange,
  breedName,
  onBreedNameChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Breed</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter custom breed name"
            value={breedName}
            onChange={(e) => onBreedNameChange(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!breedName.trim()}>
            Add Breed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomBreedDialog;
