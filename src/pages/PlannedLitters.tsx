
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { z } from 'zod';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterCard from '@/components/planned-litters/PlannedLitterCard';
import AddPlannedLitterDialog from '@/components/planned-litters/AddPlannedLitterDialog';
import EmptyPlannedLitters from '@/components/planned-litters/EmptyPlannedLitters';

const loadPlannedLitters = (): PlannedLitter[] => {
  const stored = localStorage.getItem('plannedLitters');
  if (stored) {
    return JSON.parse(stored);
  }
  return [
    {
      id: '1',
      maleId: '3',
      femaleId: '2',
      maleName: 'Rocky',
      femaleName: 'Bella',
      expectedHeatDate: '2025-05-15',
      notes: 'First planned breeding, watching for genetic diversity'
    }
  ];
};

const formSchema = z.object({
  maleId: z.string().optional(),
  femaleId: z.string({ required_error: "Dam is required" }),
  expectedHeatDate: z.date({
    required_error: "Expected heat date is required",
  }),
  notes: z.string().optional(),
  externalMale: z.boolean().default(false),
  externalMaleName: z.string().optional(),
  externalMaleBreed: z.string().optional(),
}).refine(data => {
  if (data.externalMale) {
    return !!data.externalMaleName;
  }
  return !!data.maleId;
}, {
  message: "Please select a male dog or provide external dog details",
  path: ["maleId"],
});

const PlannedLittersContent: React.FC = () => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>(loadPlannedLitters());
  const [openDialog, setOpenDialog] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState<{ [litterId: string]: boolean }>({});
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  useEffect(() => {
    localStorage.setItem('plannedLitters', JSON.stringify(plannedLitters));
  }, [plannedLitters]);
  
  const handleAddPlannedLitter = (values: z.infer<typeof formSchema>) => {
    let maleName: string;
    let maleId: string;
    
    if (values.externalMale) {
      maleName = values.externalMaleName || "Unknown Sire";
      maleId = `external-${Date.now()}`;
    } else {
      const male = dogs.find(dog => dog.id === values.maleId);
      if (!male) {
        toast({
          title: "Error",
          description: "Selected male dog not found.",
          variant: "destructive"
        });
        return;
      }
      maleName = male.name;
      maleId = male.id;
    }
    
    const female = dogs.find(dog => dog.id === values.femaleId);
    if (!female) {
      toast({
        title: "Error",
        description: "Selected female dog not found.",
        variant: "destructive"
      });
      return;
    }
    
    const newLitter: PlannedLitter = {
      id: Date.now().toString(),
      maleId: maleId,
      femaleId: values.femaleId,
      maleName: maleName,
      femaleName: female.name,
      expectedHeatDate: format(values.expectedHeatDate, 'yyyy-MM-dd'),
      notes: values.notes || '',
      externalMale: values.externalMale,
      externalMaleBreed: values.externalMaleBreed,
    };
    
    setPlannedLitters([...plannedLitters, newLitter]);
    setOpenDialog(false);
    
    toast({
      title: "Planned Litter Added",
      description: `${maleName} × ${female.name} planned breeding added successfully.`
    });
  };
  
  const handleAddMatingDate = (litterId: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const updatedLitters = plannedLitters.map(litter => 
      litter.id === litterId 
        ? { 
            ...litter, 
            matingDates: [...(litter.matingDates || []), formattedDate] 
          } 
        : litter
    );
    
    setPlannedLitters(updatedLitters);
    localStorage.setItem('plannedLitters', JSON.stringify(updatedLitters));
    
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
    const updatedLitters = plannedLitters.filter(litter => litter.id !== litterId);
    setPlannedLitters(updatedLitters);
    localStorage.setItem('plannedLitters', JSON.stringify(updatedLitters));
    
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
