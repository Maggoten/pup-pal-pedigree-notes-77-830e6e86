
import React, { useState } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import LitterDetails from './LitterDetails';
import AddPuppyDialog from './AddPuppyDialog';
import PuppyList from './PuppyList';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';
import { toast } from '@/components/ui/use-toast';
import { Dialog } from '@/components/ui/dialog';

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
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
  
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
  
  const handleRowSelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
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
            onUpdateLitter={onUpdateLitter}
            onDeleteLitter={onDeleteLitter}
            onArchiveLitter={onArchiveLitter}
            onAddPuppy={onAddPuppy}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
          />
        </div>
        
        <div className="md:col-span-1 lg:col-span-2">
          <PuppyList 
            puppies={selectedLitter.puppies}
            onAddPuppy={() => setShowAddPuppyDialog(true)}
            onSelectPuppy={setSelectedPuppy}
            onRowSelect={handleRowSelect}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
            showAddPuppyDialog={showAddPuppyDialog}
            setShowAddPuppyDialog={setShowAddPuppyDialog}
            puppyNumber={1} // Always start with puppy 1 for each litter
            litterDob={selectedLitter.dateOfBirth}
            selectedPuppy={selectedPuppy}
            damBreed="" // Pass an empty string for now
          />
        </div>
      </div>
      
      {/* Add Puppy Dialog - Wrapped in a Dialog component */}
      <Dialog open={showAddPuppyDialog} onOpenChange={setShowAddPuppyDialog}>
        <AddPuppyDialog 
          onClose={() => setShowAddPuppyDialog(false)}
          onSubmit={onAddPuppy}
          puppyNumber={selectedLitter.puppies.length + 1}
          litterDob={selectedLitter.dateOfBirth}
          damBreed=""
        />
      </Dialog>
      
      {/* Puppy Details Dialog - Only render when a puppy is selected, wrapped in Dialog */}
      {selectedPuppy && (
        <Dialog open={showPuppyDetailsDialog} onOpenChange={setShowPuppyDetailsDialog}>
          <PuppyDetailsDialog 
            puppy={selectedPuppy}
            onClose={() => setShowPuppyDetailsDialog(false)}
            onUpdate={onUpdatePuppy}
            onDelete={onDeletePuppy}
          />
        </Dialog>
      )}
    </div>
  );
};

export default SelectedLitterSection;
