
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
  const [activePuppy, setActivePuppy] = useState<Puppy | null>(null);
  
  const handlePuppyClick = (puppy: Puppy) => {
    setActivePuppy(puppy);
    onSelectPuppy(puppy === selectedPuppy ? null : puppy);
  };
  
  const handleAddMeasurement = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setMeasurementDialogOpen(true);
  };
  
  // Improved next puppy number calculation
  const getNextPuppyNumber = () => {
    if (puppies.length === 0) return 1;
    
    // Extract numeric parts from puppy names using a regex
    const numberPattern = /Puppy\s+(\d+)/i;
    const numbers = puppies
      .map(puppy => {
        const match = puppy.name.match(numberPattern);
        return match && match[1] ? parseInt(match[1], 10) : null;
      })
      .filter(num => num !== null) as number[];
    
    // If we found numbered puppies, use the max + 1, otherwise use puppies.length + 1
    return numbers.length > 0
      ? Math.max(...numbers) + 1
      : puppies.length + 1;
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4" />
                <span>Add Puppy</span>
              </Button>
            </DialogTrigger>
            <AddPuppyDialog 
              onAddPuppy={onAddPuppy} 
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
            onUpdatePuppy={onUpdatePuppy} 
            onDeletePuppy={onDeletePuppy}
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
            onUpdate={onUpdatePuppy}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default PuppiesTabContent;
