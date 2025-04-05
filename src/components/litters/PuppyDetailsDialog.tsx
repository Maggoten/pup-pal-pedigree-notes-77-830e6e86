
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import PuppyDetailsForm from './puppies/PuppyDetailsForm';
import PuppyImageUploader from './puppies/PuppyImageUploader';
import { Trash2 } from 'lucide-react';

interface PuppyDetailsDialogProps {
  puppy: Puppy;
  onClose?: () => void;
  onUpdatePuppy: (updatedPuppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const PuppyDetailsDialog: React.FC<PuppyDetailsDialogProps> = ({ 
  puppy, 
  onClose, 
  onUpdatePuppy,
  onDeletePuppy
}) => {
  const [imageUrl, setImageUrl] = useState<string>(puppy.imageUrl || '');
  
  const handleImageChange = (newImageUrl: string) => {
    setImageUrl(newImageUrl);
  };
  
  const handleSubmit = (updatedPuppyData: Puppy) => {
    // Combine the updated puppy data with the image URL
    const updatedPuppy = {
      ...updatedPuppyData,
      imageUrl: imageUrl
    };
    
    onUpdatePuppy(updatedPuppy);
    toast({
      title: "Puppy Updated",
      description: `${updatedPuppy.name} has been updated successfully.`
    });
    if (onClose) onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${puppy.name}?`)) {
      onDeletePuppy(puppy.id);
      toast({
        title: "Puppy Deleted",
        description: `${puppy.name} has been deleted from the litter.`,
        variant: "destructive"
      });
      if (onClose) onClose();
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Puppy Information</DialogTitle>
        <DialogDescription>
          View and edit information for {puppy.name}.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6">
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Puppy Photo</h3>
          <PuppyImageUploader 
            puppyName={puppy.name}
            currentImage={imageUrl}
            onImageChange={handleImageChange}
          />
        </div>
        
        <PuppyDetailsForm puppy={puppy} onSubmit={handleSubmit} />
      </div>

      <DialogFooter className="mt-6 flex items-center justify-between">
        <Button 
          type="button" 
          variant="destructive" 
          onClick={handleDelete}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Puppy
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="puppy-form">
            Save Changes
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default PuppyDetailsDialog;
