import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Puppy } from '@/types/breeding';
import PuppyList from '../PuppyList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, PawPrint } from 'lucide-react';
import AddPuppyDialog from '../AddPuppyDialog';
import PuppyMeasurementsDialog from '../puppies/PuppyMeasurementsDialog';
import PuppyDetailsDialog from '../PuppyDetailsDialog';

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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activePuppy, setActivePuppy] = useState<Puppy | null>(null);
  
  useEffect(() => {
    console.log("PuppiesTabContent rendered with puppies:", puppies);
    if (!puppies || puppies.length === 0) {
      console.log("No puppies found in this litter");
    } else {
      console.log("Puppy details:", JSON.stringify(puppies[0], null, 2));
    }
    console.log("Dam breed:", damBreed); // Log the dam breed for debugging
  }, [puppies, damBreed]);
  
  const handlePuppyClick = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setDetailsDialogOpen(true);
    onSelectPuppy(puppy === selectedPuppy ? null : puppy);
  };
  
  const handleAddMeasurement = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setMeasurementDialogOpen(true);
  };
  
  const getNextPuppyNumber = () => {
    return puppies.length + 1;
  };
  
  const handleDeletePuppy = (puppyId: string) => {
    onDeletePuppy(puppyId);
    setDetailsDialogOpen(false);
  };
  
  const handleAddPuppy = async (puppy: Puppy) => {
    console.log("PuppiesTabContent - Adding puppy:", puppy);
    await onAddPuppy(puppy);
    setAddPuppyDialogOpen(false);
  };
  
  const updatePuppyNames = (updatedPuppy: Puppy) => {
    onUpdatePuppy(updatedPuppy);
  };
  
  return (
    <Card className="shadow-sm bg-white border border-warmbeige-200">
      <CardHeader className="bg-warmbeige-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Puppies {puppies && puppies.length > 0 && `(${puppies.length})`}
            </CardTitle>
          </div>
          
          <Dialog open={addPuppyDialogOpen} onOpenChange={setAddPuppyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 bg-warmbeige-50 hover:bg-warmbeige-200" onClick={() => setAddPuppyDialogOpen(true)}>
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
        {puppies && puppies.length > 0 ? (
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
      
      <Dialog open={measurementDialogOpen} onOpenChange={setMeasurementDialogOpen}>
        {activePuppy && (
          <PuppyMeasurementsDialog 
            puppy={activePuppy} 
            onClose={() => setMeasurementDialogOpen(false)} 
            onUpdate={updatePuppyNames}
          />
        )}
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        {activePuppy && (
          <PuppyDetailsDialog
            puppy={activePuppy}
            onClose={() => setDetailsDialogOpen(false)}
            onUpdatePuppy={updatePuppyNames}
            onDeletePuppy={handleDeletePuppy}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default PuppiesTabContent;
