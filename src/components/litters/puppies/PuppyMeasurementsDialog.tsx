
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
  
  // Create a deep clone of the puppy data to work with
  const [localPuppy, setLocalPuppy] = useState<Puppy>(() => {
    // Ensure we create proper deep copies of all arrays
    return {
      ...puppy,
      weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
      heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
      notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
    };
  });

  // Debug the currently loaded puppy data
  console.log(`PuppyMeasurementsDialog for ${puppy.name} (${puppy.id})`, {
    initialWeightLogLength: puppy.weightLog?.length || 0,
    localPuppyWeightLogLength: localPuppy.weightLog?.length || 0,
    localPuppyWeightLog: localPuppy.weightLog || []
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
    
    console.log(`Adding weight record for ${localPuppy.name} (${localPuppy.id})`, {
      newRecord: newWeightRecord,
      currentWeightLogLength: localPuppy.weightLog?.length || 0
    });
    
    // Create a completely new puppy object with the updated weight log
    const updatedPuppy = {
      ...localPuppy,
      weightLog: [
        ...(localPuppy.weightLog || []),
        newWeightRecord
      ],
      // Update the currentWeight to this new weight value
      currentWeight: weightValue
    };

    console.log(`After adding weight record:`, {
      puppyId: updatedPuppy.id,
      weightLogLength: updatedPuppy.weightLog.length,
      updatedWeightLog: updatedPuppy.weightLog
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
    
    // Create a completely new puppy object with the updated height log
    const updatedPuppy = {
      ...localPuppy,
      heightLog: [
        ...(localPuppy.heightLog || []),
        newHeightRecord
      ]
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
    
    // Create a completely new puppy object with the updated notes
    const updatedPuppy = {
      ...localPuppy,
      notes: [
        ...(localPuppy.notes || []),
        newNote
      ]
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
