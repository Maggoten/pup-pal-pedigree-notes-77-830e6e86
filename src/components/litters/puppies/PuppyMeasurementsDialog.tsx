import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';

import DateTimeSelector from './DateTimeSelector';
import PuppyWeightTab from './PuppyWeightTab';
import PuppyHeightTab from './PuppyHeightTab';
import PuppyNotesTab from './PuppyNotesTab';

interface PuppyMeasurementsDialogProps {
  puppy: Puppy;
  onClose: () => void;
  onUpdate: (updatedPuppy: Puppy) => void;
}

const PuppyMeasurementsDialog: React.FC<PuppyMeasurementsDialogProps> = ({ 
  puppy, 
  onClose, 
  onUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('weight');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), 'HH:mm')
  );
  // Local state to track updated puppy data
  const [localPuppy, setLocalPuppy] = useState<Puppy>(puppy);

  const handleAddWeight = () => {
    if (!weight || isNaN(parseFloat(weight))) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight",
        variant: "destructive"
      });
      return;
    }

    const measurementDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    measurementDate.setHours(hours, minutes);

    const weightValue = parseFloat(weight);
    const newWeightRecord = { 
      date: measurementDate.toISOString(), 
      weight: weightValue 
    };
    
    const updatedPuppy = {
      ...localPuppy,
      weightLog: [
        ...localPuppy.weightLog,
        newWeightRecord
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      // Update the currentWeight to this new weight value
      currentWeight: weightValue
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setWeight('');
    
    toast({
      title: "Weight Recorded",
      description: `${puppy.name}'s weight has been recorded and current weight updated.`
    });
  };

  const handleAddHeight = () => {
    if (!height || isNaN(parseFloat(height))) {
      toast({
        title: "Invalid Height",
        description: "Please enter a valid height",
        variant: "destructive"
      });
      return;
    }

    const measurementDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    measurementDate.setHours(hours, minutes);

    const newHeightRecord = { 
      date: measurementDate.toISOString(), 
      height: parseFloat(height) 
    };
    
    const updatedPuppy = {
      ...localPuppy,
      heightLog: [
        ...localPuppy.heightLog,
        newHeightRecord
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setHeight('');
    
    toast({
      title: "Height Recorded",
      description: `${puppy.name}'s height has been recorded successfully.`
    });
  };

  const handleAddNote = () => {
    if (!note.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter a note",
        variant: "destructive"
      });
      return;
    }

    const noteDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    noteDate.setHours(hours, minutes);

    // Make sure the puppy has a notes array, or create one
    const currentNotes = localPuppy.notes || [];

    const newNote = { 
      date: noteDate.toISOString(), 
      content: note 
    };

    const updatedPuppy = {
      ...localPuppy,
      notes: [
        ...currentNotes,
        newNote
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setNote('');
    
    toast({
      title: "Note Added",
      description: `Note for ${puppy.name} has been added successfully.`
    });
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{puppy.name} - Growth Measurements</DialogTitle>
        <DialogDescription>
          Record weight, height, and notes for this puppy.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-2">
        <DateTimeSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="height">Height</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight" className="space-y-4 mt-4">
            <PuppyWeightTab
              puppy={localPuppy}
              weight={weight}
              setWeight={setWeight}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onAddWeight={handleAddWeight}
            />
          </TabsContent>
          
          <TabsContent value="height" className="space-y-4 mt-4">
            <PuppyHeightTab
              puppy={localPuppy}
              height={height}
              setHeight={setHeight}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onAddHeight={handleAddHeight}
            />
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4 mt-4">
            <PuppyNotesTab
              puppy={localPuppy}
              note={note}
              setNote={setNote}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onAddNote={handleAddNote}
            />
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PuppyMeasurementsDialog;
