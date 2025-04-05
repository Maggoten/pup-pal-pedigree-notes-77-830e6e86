
import React, { useState } from 'react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Users } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import PuppyList from './PuppyList';
import AddPuppyDialog from './AddPuppyDialog';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyMeasurementsDialog from './puppies/PuppyMeasurementsDialog';

interface PuppiesSectionProps {
  puppies: Puppy[];
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  litterDob: string;
  damBreed?: string;
  onSelectPuppy?: (puppy: Puppy | null) => void;
  selectedPuppy?: Puppy | null;
}

const PuppiesSection: React.FC<PuppiesSectionProps> = ({
  puppies,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  litterDob,
  damBreed,
  onSelectPuppy,
  selectedPuppy
}) => {
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [activePuppy, setActivePuppy] = useState<Puppy | null>(null);
  
  const handlePuppyClick = (puppy: Puppy) => {
    setActivePuppy(puppy);
    if (onSelectPuppy) {
      onSelectPuppy(puppy === selectedPuppy ? null : puppy);
    }
  };
  
  const handleAddMeasurement = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setMeasurementDialogOpen(true);
  };
  
  const litterAge = differenceInWeeks(new Date(), parseISO(litterDob));
  
  // Determine the next puppy number based on existing puppies
  const getNextPuppyNumber = () => {
    if (puppies.length === 0) return 1;
    
    // Try to find the highest number in existing puppy names
    const numberPattern = /Puppy\s+(\d+)/i;
    let highestNumber = 0;
    
    puppies.forEach(puppy => {
      const match = puppy.name.match(numberPattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    // If we found numbered puppies, return the next number, otherwise default to puppies.length + 1
    return highestNumber > 0 ? highestNumber + 1 : puppies.length + 1;
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

export default PuppiesSection;
