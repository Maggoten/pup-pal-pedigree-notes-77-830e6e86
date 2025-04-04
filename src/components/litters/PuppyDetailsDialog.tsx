
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import PuppyDetailsForm from './puppies/PuppyDetailsForm';
import ImageUploader from '@/components/ImageUploader';

interface PuppyDetailsDialogProps {
  puppy: Puppy;
  onClose: () => void;
  onUpdate: (updatedPuppy: Puppy) => void;
}

const PuppyDetailsDialog: React.FC<PuppyDetailsDialogProps> = ({ 
  puppy, 
  onClose, 
  onUpdate 
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
    
    onUpdate(updatedPuppy);
    toast({
      title: "Puppy Updated",
      description: `${updatedPuppy.name} has been updated successfully.`
    });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Puppy</DialogTitle>
        <DialogDescription>
          Edit information for {puppy.name}.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6">
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Puppy Photo</h3>
          <ImageUploader 
            currentImage={puppy.imageUrl}
            onImageChange={handleImageChange}
            className="max-w-[200px] mx-auto"
          />
        </div>
        
        <PuppyDetailsForm puppy={puppy} onSubmit={handleSubmit} />
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="puppy-form">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PuppyDetailsDialog;
