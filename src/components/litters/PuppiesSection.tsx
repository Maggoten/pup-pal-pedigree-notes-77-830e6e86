
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import PuppyList from './PuppyList';
import { Dialog } from '@/components/ui/dialog';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import AddPuppyDialog from './AddPuppyDialog';

interface PuppiesSectionProps {
  puppies: Puppy[];
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  litterDob: string;
  damBreed?: string;
}

const PuppiesSection: React.FC<PuppiesSectionProps> = ({
  puppies,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  litterDob,
  damBreed = ""
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
  
  const handleRowSelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Puppies ({puppies.length})</h3>
      </div>
      
      <PuppyList 
        puppies={puppies}
        onAddPuppy={() => setShowAddPuppyDialog(true)}
        onSelectPuppy={setSelectedPuppy}
        onRowSelect={handleRowSelect}
        onUpdatePuppy={onUpdatePuppy}
        onDeletePuppy={onDeletePuppy}
        showAddPuppyDialog={showAddPuppyDialog}
        setShowAddPuppyDialog={setShowAddPuppyDialog}
        puppyNumber={1}
        litterDob={litterDob}
        selectedPuppy={selectedPuppy}
        damBreed={damBreed}
      />
      
      {/* Add Puppy Dialog - Wrapped in a Dialog component */}
      <Dialog open={showAddPuppyDialog} onOpenChange={setShowAddPuppyDialog}>
        <AddPuppyDialog 
          onClose={() => setShowAddPuppyDialog(false)}
          onSubmit={onAddPuppy}
          puppyNumber={puppies.length + 1}
          litterDob={litterDob}
          damBreed={damBreed}
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

export default PuppiesSection;
