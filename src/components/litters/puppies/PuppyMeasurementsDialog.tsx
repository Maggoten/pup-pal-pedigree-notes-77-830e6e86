import React, { useState, useCallback, useEffect } from 'react';
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
  
  // Create a deep clone of the puppy data on component mount and when puppy changes
  // This isolates the data for this specific puppy instance
  const [localPuppy, setLocalPuppy] = useState<Puppy>(() => {
    console.log(`PuppyMeasurementsDialog: Initializing local puppy for ${puppy.name} (${puppy.id})`);
    // Create proper deep copies of all arrays to avoid reference issues
    return {
      ...puppy,
      weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
      heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
      notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
    };
  });
  
  // Update local puppy state when the prop changes (e.g., after a successful update)
  useEffect(() => {
    console.log(`PuppyMeasurementsDialog: Puppy prop changed for ${puppy.name} (${puppy.id})`, {
      weightLogLength: puppy.weightLog?.length || 0,
      currentWeight: puppy.currentWeight,
      puppyId: puppy.id
    });
    
    // Always create a fresh deep copy when the puppy prop changes
    setLocalPuppy({
      ...puppy,
      weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
      heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
      notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
    });
    
    // Reset form states when puppy changes
    setWeight('');
    setHeight('');
    setNote('');
  }, [puppy.id, puppy.weightLog, puppy.heightLog, puppy.notes, puppy.currentWeight, puppy.name]);

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
    
    // Create a completely new puppy object with the updated weight log and currentWeight
    const updatedPuppy = {
      ...localPuppy,
      weightLog: [
        ...(localPuppy.weightLog || []),
        newWeightRecord
      ],
      // Always update the currentWeight to this new weight value for backward compatibility
      currentWeight: weightValue
    };

    console.log(`After adding weight record for ${updatedPuppy.name}:`, {
      puppyId: updatedPuppy.id,
      weightLogLength: updatedPuppy.weightLog.length,
      currentWeight: updatedPuppy.currentWeight
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
