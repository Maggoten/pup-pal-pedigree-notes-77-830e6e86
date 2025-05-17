
import React, { useState, useCallback } from 'react';
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

  // Debug the currently loaded puppy data
  console.log(`PuppyMeasurementsDialog for ${puppy.name} (${puppy.id})`, {
    initialWeightLog: puppy.weightLog,
    currentLocalWeight: localPuppy.weightLog
  });

  // Memoize event handlers to prevent recreating on each render
  const handleAddWeight = useCallback(() => {
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
    
    // Ensure weightLog exists before adding to it
    const existingWeightLog = localPuppy.weightLog || [];
    
    // Log what we're adding to help with debugging
    console.log(`Adding weight record for ${localPuppy.name} (${localPuppy.id})`, {
      newRecord: newWeightRecord,
      existingLogs: existingWeightLog.length
    });
    
    const updatedPuppy = {
      ...localPuppy,
      weightLog: [
        ...existingWeightLog,
        newWeightRecord
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      // Update the currentWeight to this new weight value
      currentWeight: weightValue
    };

    // Log the updated puppy for debugging
    console.log(`Updated puppy object for ${updatedPuppy.name}`, {
      weightLogCount: updatedPuppy.weightLog.length
    });

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setWeight('');
    
    toast({
      title: "Weight Recorded",
      description: `${puppy.name}'s weight has been recorded and current weight updated.`
    });
  }, [weight, selectedDate, selectedTime, localPuppy, puppy.name, onUpdate]);

  const handleAddHeight = useCallback(() => {
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

    const heightValue = parseFloat(height);
    const newHeightRecord = { 
      date: measurementDate.toISOString(), 
      height: heightValue 
    };
    
    // Ensure heightLog exists before adding to it
    const existingHeightLog = localPuppy.heightLog || [];
    
    const updatedPuppy = {
      ...localPuppy,
      heightLog: [
        ...existingHeightLog,
        newHeightRecord
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setHeight('');
    
    toast({
      title: "Height Recorded",
      description: `${puppy.name}'s height has been recorded.`
    });
  }, [height, selectedDate, selectedTime, localPuppy, puppy.name, onUpdate]);

  const handleAddNote = useCallback(() => {
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

    const newNote = { 
      date: noteDate.toISOString(), 
      content: note.trim() 
    };
    
    // Ensure notes array exists
    const existingNotes = localPuppy.notes || [];
    
    const updatedPuppy = {
      ...localPuppy,
      notes: [
        ...existingNotes,
        newNote
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setNote('');
    
    toast({
      title: "Note Added",
      description: `Note added for ${puppy.name}.`
    });
  }, [note, selectedDate, selectedTime, localPuppy, puppy.name, onUpdate]);

  return (
    <DialogContent className="sm:max-w-[600px]" onInteractOutside={onClose}>
      <DialogHeader>
        <DialogTitle>Record Measurements for {puppy.name}</DialogTitle>
        <DialogDescription>
          Add weight, height, or notes for tracking puppy development.
        </DialogDescription>
      </DialogHeader>

      <DateTimeSelector 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="height">Height</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="weight">
          <PuppyWeightTab
            puppy={localPuppy}
            weight={weight}
            setWeight={setWeight}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onAddWeight={handleAddWeight}
          />
        </TabsContent>
        <TabsContent value="height">
          <PuppyHeightTab
            puppy={localPuppy}
            height={height}
            setHeight={setHeight}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onAddHeight={handleAddHeight}
          />
        </TabsContent>
        <TabsContent value="notes">
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

      <DialogFooter className="mt-4 gap-2">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PuppyMeasurementsDialog;
