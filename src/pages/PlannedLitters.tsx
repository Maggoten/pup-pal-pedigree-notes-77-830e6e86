
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterCard from '@/components/planned-litters/PlannedLitterCard';
import AddPlannedLitterDialog from '@/components/planned-litters/AddPlannedLitterDialog';
import EmptyPlannedLitters from '@/components/planned-litters/EmptyPlannedLitters';
import { plannedLitterService, PlannedLitterFormValues } from '@/services/PlannedLitterService';

const PlannedLittersContent: React.FC = () => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState<{ [litterId: string]: boolean }>({});
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  // Load planned litters on component mount
  useEffect(() => {
    const litters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(litters);
  }, []);
  
  // Save planned litters to localStorage whenever they change
  useEffect(() => {
    plannedLitterService.savePlannedLitters(plannedLitters);
  }, [plannedLitters]);
  
  const handleAddPlannedLitter = (values: PlannedLitterFormValues) => {
    try {
      const newLitter = plannedLitterService.createPlannedLitter(values, dogs);
      setPlannedLitters([...plannedLitters, newLitter]);
      setOpenDialog(false);
      
      toast({
        title: "Planned Litter Added",
        description: `${newLitter.maleName} × ${newLitter.femaleName} planned breeding added successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleAddMatingDate = (litterId: string, date: Date) => {
    const updatedLitters = plannedLitterService.addMatingDate(plannedLitters, litterId, date);
    setPlannedLitters(updatedLitters);
    
    toast({
      title: "Mating Date Added",
      description: `Mating date ${format(date, 'PPP')} added successfully. A pregnancy has been created.`
    });
    
    // Close the calendar after selection
    setCalendarOpen({
      ...calendarOpen,
      [litterId]: false
    });
  };

  const handleDeleteLitter = (litterId: string) => {
    const updatedLitters = plannedLitterService.deletePlannedLitter(plannedLitters, litterId);
    setPlannedLitters(updatedLitters);
    
    toast({
      title: "Planned Litter Deleted",
      description: "The planned litter has been removed successfully."
    });
  };

  return (
    <PageLayout 
      title="Planned Litters" 
      description="Plan your future litters and track breeding combinations"
    >
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Planned Litter
            </Button>
          </DialogTrigger>
          <AddPlannedLitterDialog 
            males={males} 
            females={females} 
            onSubmit={handleAddPlannedLitter} 
          />
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plannedLitters.map(litter => (
          <PlannedLitterCard 
            key={litter.id}
            litter={litter}
            onAddMatingDate={handleAddMatingDate}
            onDeleteLitter={handleDeleteLitter}
            calendarOpen={calendarOpen[litter.id] || false}
            onCalendarOpenChange={(open) => setCalendarOpen({...calendarOpen, [litter.id]: open})}
          />
        ))}
      </div>

      {plannedLitters.length === 0 && (
        <EmptyPlannedLitters onAddClick={() => setOpenDialog(true)} />
      )}
    </PageLayout>
  );
};

const PlannedLitters: React.FC = () => {
  return <PlannedLittersContent />;
};

export default PlannedLitters;
