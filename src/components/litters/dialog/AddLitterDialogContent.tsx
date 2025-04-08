
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewLitterTabContent from './NewLitterTabContent';
import PlannedLitterTabContent from './PlannedLitterTabContent';
import { Litter, PlannedLitter } from '@/types/breeding';

interface AddLitterDialogContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
  plannedLitters: PlannedLitter[];
}

const AddLitterDialogContent: React.FC<AddLitterDialogContentProps> = ({ 
  onClose, 
  onLitterAdded, 
  plannedLitters 
}) => {
  const [activeTab, setActiveTab] = useState('newLitter');

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>Add New Litter</DialogTitle>
        <DialogDescription>
          Create a new litter record for your breeding program
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="newLitter">New Litter</TabsTrigger>
          <TabsTrigger value="plannedLitter">From Planned Litter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="newLitter" className="space-y-4 mt-4">
          <NewLitterTabContent onClose={onClose} onLitterAdded={onLitterAdded} />
        </TabsContent>
        
        <TabsContent value="plannedLitter" className="space-y-4">
          <PlannedLitterTabContent 
            onClose={onClose} 
            onLitterAdded={onLitterAdded}
            plannedLitters={plannedLitters}
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};

export default AddLitterDialogContent;
