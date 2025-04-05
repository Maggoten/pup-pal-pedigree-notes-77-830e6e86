
import React, { useState } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import LitterDetails from './LitterDetails';
import AddPuppyDialog from './AddPuppyDialog';
import PuppyList from './PuppyList';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';
import { toast } from '@/components/ui/use-toast';

interface SelectedLitterSectionProps {
  selectedLitter: Litter | null;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const SelectedLitterSection: React.FC<SelectedLitterSectionProps> = ({
  selectedLitter,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  
  // If no litter is selected, don't show this section
  if (!selectedLitter) {
    return null;
  }
  
  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? "Item marked as completed" 
        : "Item marked as not completed"
    });
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{selectedLitter.name}</h2>
      
      {/* Add the Puppy Development Checklist component */}
      <PuppyDevelopmentChecklist 
        litter={selectedLitter} 
        onToggleItem={handleToggleChecklistItem} 
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-1">
          <LitterDetails 
            litter={selectedLitter}
            onUpdate={onUpdateLitter}
            onDelete={onDeleteLitter}
            onArchive={onArchiveLitter}
          />
        </div>
        
        <div className="md:col-span-1 lg:col-span-2">
          <PuppyList 
            puppies={selectedLitter.puppies}
            onAddPuppy={() => setShowAddPuppyDialog(true)}
            onSelectPuppy={setSelectedPuppy}
          />
        </div>
      </div>
      
      {/* Dialogs */}
      <AddPuppyDialog 
        open={showAddPuppyDialog}
        onOpenChange={setShowAddPuppyDialog}
        onAddPuppy={onAddPuppy}
        litter={selectedLitter}
      />
      
      <PuppyDetailsDialog 
        puppy={selectedPuppy}
        onClose={() => setSelectedPuppy(null)}
        onUpdate={onUpdatePuppy}
        onDelete={onDeletePuppy}
      />
    </div>
  );
};

export default SelectedLitterSection;
