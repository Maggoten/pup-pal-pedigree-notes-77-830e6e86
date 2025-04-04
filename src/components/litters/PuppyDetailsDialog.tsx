
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import PuppyDetailsForm from './puppies/PuppyDetailsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PuppyGrowthLogger from './puppies/PuppyGrowthLogger';

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
  const [activeTab, setActiveTab] = useState('details');

  const handleSubmit = (updatedPuppy: Puppy) => {
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
        <DialogTitle>Puppy Details</DialogTitle>
        <DialogDescription>
          View and edit puppy information.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="growth">Growth Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <PuppyDetailsForm puppy={puppy} onSubmit={handleSubmit} />
        </TabsContent>
        
        <TabsContent value="growth">
          <PuppyGrowthLogger 
            puppy={puppy} 
            onUpdatePuppy={onUpdate}
          />
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        {activeTab === 'details' && (
          <Button type="submit" form="puppy-form" onClick={(e) => {
            // This will trigger the form's onSubmit
            const form = document.querySelector('form');
            if (form) {
              e.preventDefault();
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}>
            Save Changes
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default PuppyDetailsDialog;
