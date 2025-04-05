
import React, { useState } from 'react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Puppy } from '@/types/breeding';
import PuppyList from '../PuppyList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Users } from 'lucide-react';
import AddPuppyDialog from '../AddPuppyDialog';
import PuppyMeasurementsDialog from '../puppies/PuppyMeasurementsDialog';

interface PuppiesTabContentProps {
  puppies: Puppy[];
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  litterDob: string;
  damBreed?: string;
  onSelectPuppy: (puppy: Puppy | null) => void;
  selectedPuppy: Puppy | null;
  litterAge: number;
}

const PuppiesTabContent: React.FC<PuppiesTabContentProps> = ({
  puppies,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  litterDob,
  damBreed,
  onSelectPuppy,
  selectedPuppy,
  litterAge,
}) => {
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [addPuppyDialogOpen, setAddPuppyDialogOpen] = useState(false);
  const [activePuppy, setActivePuppy] = useState<Puppy | null>(null);
  
  const handlePuppyClick = (puppy: Puppy) => {
    setActivePuppy(puppy);
    onSelectPuppy(puppy === selectedPuppy ? null : puppy);
  };
  
  const handleAddMeasurement = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setMeasurementDialogOpen(true);
  };
  
  // Get next puppy number based on position in the list
  const getNextPuppyNumber = () => {
    return puppies.length + 1;
  };
  
  // Update puppy names after deletion to maintain consistent numbering
  const handleDeletePuppy = (puppyId: string) => {
    onDeletePuppy(puppyId);
    
    // The puppies state will be updated by the parent component after deletion
    // We don't need to manually update names here
  };
  
  const handleAddPuppy = (puppy: Puppy) => {
    onAddPuppy(puppy);
    setAddPuppyDialogOpen(false);
  };
  
  // Function to update puppy names to match their position
  const updatePuppyNames = (updatedPuppy: Puppy) => {
    // Only update custom naming if we're editing a puppy with a name in the format "Puppy X"
    const puppyNamePattern = /^Puppy \d+$/;
    if (!puppyNamePattern.test(updatedPuppy.name)) {
      // If it's a custom name, just update without renaming
      onUpdatePuppy(updatedPuppy);
      return;
    }
    
    // Find the puppy's index
    const index = puppies.findIndex(p => p.id === updatedPuppy.id);
    if (index !== -1) {
      // Update the name to match its position+1
      const newPuppy = {
        ...updatedPuppy,
        name: `Puppy ${index + 1}`
      };
      onUpdatePuppy(newPuppy);
    } else {
      // Just update the puppy if we can't find it (shouldn't happen)
      onUpdatePuppy(updatedPuppy);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Puppies {puppies.length > 0 && `(${puppies.length})`}
            </CardTitle>
          </div>
          
          <Dialog open={addPuppyDialogOpen} onOpenChange={setAddPuppyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => setAddPuppyDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                <span>Add Puppy</span>
              </Button>
            </DialogTrigger>
            <AddPuppyDialog 
              onAddPuppy={handleAddPuppy} 
              onClose={() => setAddPuppyDialogOpen(false)}
              litterDob={litterDob} 
              damBreed={damBreed}
              puppyNumber={getNextPuppyNumber()}
            />
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {puppies.length > 0 ? (
          <PuppyList 
            puppies={puppies} 
            onUpdatePuppy={updatePuppyNames} 
            onDeletePuppy={handleDeletePuppy}
            onPuppyClick={handlePuppyClick}
            selectedPuppyId={selectedPuppy?.id}
            onAddMeasurement={handleAddMeasurement}
            litterAge={litterAge}
          />
        ) : (
          <div className="text-center py-8 space-y-3">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <h3 className="text-lg font-medium">No Puppies Added Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Add your puppies to track their growth, development milestones, and keep detailed records.
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Puppy Measurements Dialog */}
      <Dialog open={measurementDialogOpen} onOpenChange={setMeasurementDialogOpen}>
        {activePuppy && (
          <PuppyMeasurementsDialog 
            puppy={activePuppy} 
            onClose={() => setMeasurementDialogOpen(false)} 
            onUpdate={updatePuppyNames}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default PuppiesTabContent;
