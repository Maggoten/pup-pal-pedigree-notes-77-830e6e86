
import React, { useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
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
  // Make sure we're using the exact puppy name without any manipulation
  const [displayName, setDisplayName] = useState<string>(puppy.name);
  
  // Update display name when puppy prop changes - ensure we're using the exact name
  useEffect(() => {
    setDisplayName(puppy.name);
  }, [puppy.name]);
  
  const handleImageChange = useCallback((newImageUrl: string) => {
    setImageUrl(newImageUrl);
  }, []);
  
  const handleSubmit = useCallback((updatedPuppyData: Puppy) => {
    // Clone the puppy data to avoid reference issues
    const updatedPuppy = {
      ...updatedPuppyData,
      imageUrl: imageUrl
    };
    
    // Pass the puppy data directly without modifying the name
    onUpdatePuppy(updatedPuppy);
    toast({
      title: "Puppy Updated",
      description: `${updatedPuppy.name} has been updated successfully.`
    });
    if (onClose) onClose();
  }, [imageUrl, onUpdatePuppy, onClose]);

  const handleDelete = useCallback(() => {
    if (confirm(`Do you want to delete "${displayName}"?`)) {
      onDeletePuppy(puppy.id);
      toast({
        title: "Puppy Deleted",
        description: `${displayName} has been deleted from the litter.`,
        variant: "destructive"
      });
      if (onClose) onClose();
    }
  }, [puppy.id, displayName, onDeletePuppy, onClose]);

  return (
    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <DialogHeader>
        <DialogTitle>Puppy Information</DialogTitle>
        <DialogDescription>
          View and edit information for {displayName}.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 mt-2">
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Puppy Photo</h3>
          <PuppyImageUploader 
            puppyName={displayName}
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
        <div>
          <Button type="submit" form="puppy-form">
            Save Changes
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(PuppyDetailsDialog);
