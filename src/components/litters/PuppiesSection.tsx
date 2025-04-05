
import React, { useState } from 'react';
import { Baby } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import PuppyList from './PuppyList';
import { Dialog } from '@/components/ui/dialog';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import AddPuppyDialog from './AddPuppyDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PuppyMeasurementsDialog from './puppies/PuppyMeasurementsDialog';

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
  const [showMeasurementsDialog, setShowMeasurementsDialog] = useState(false);
  
  const handleRowSelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
  };

  const handleMeasurementsClick = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowMeasurementsDialog(true);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Puppies ({puppies.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
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
          onMeasurementsClick={handleMeasurementsClick}
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

        {/* Puppy Measurements Dialog */}
        {selectedPuppy && (
          <Dialog open={showMeasurementsDialog} onOpenChange={setShowMeasurementsDialog}>
            <PuppyMeasurementsDialog 
              puppy={selectedPuppy}
              onClose={() => setShowMeasurementsDialog(false)}
              onUpdate={onUpdatePuppy}
            />
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default PuppiesSection;
