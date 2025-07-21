import React, { useState, useCallback, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import { updatePuppyInDb } from '@/services/puppyService';

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
  
  const [localPuppy, setLocalPuppy] = useState<Puppy>(() => {
    console.log(`PuppyMeasurementsDialog: Initializing local puppy for ${puppy.name} (${puppy.id})`);
    return {
      ...puppy,
      weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
      heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
      notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
    };
  });
  
  useEffect(() => {
    console.log(`PuppyMeasurementsDialog: Puppy prop changed for ${puppy.name} (${puppy.id})`, {
      weightLogLength: puppy.weightLog?.length || 0,
      currentWeight: puppy.currentWeight,
      puppyId: puppy.id
    });
    
    setLocalPuppy({
      ...puppy,
      weightLog: puppy.weightLog ? JSON.parse(JSON.stringify(puppy.weightLog)) : [],
      heightLog: puppy.heightLog ? JSON.parse(JSON.stringify(puppy.heightLog)) : [],
      notes: puppy.notes ? JSON.parse(JSON.stringify(puppy.notes)) : []
    });
    
    setWeight('');
    setHeight('');
    setNote('');
  }, [puppy.id, puppy.weightLog, puppy.heightLog, puppy.notes, puppy.currentWeight, puppy.name]);

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
    
    const updatedPuppy = {
      ...localPuppy,
      weightLog: [
        ...(localPuppy.weightLog || []),
        newWeightRecord
      ],
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

  const handleDeleteWeight = useCallback(async (index: number) => {
    const sortedWeightLog = [...(localPuppy.weightLog || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sortedWeightLog.splice(index, 1);
    
    let newCurrentWeight = localPuppy.currentWeight;
    if (index === 0 && sortedWeightLog.length > 0) {
      newCurrentWeight = sortedWeightLog[0].weight;
    } else if (sortedWeightLog.length === 0) {
      newCurrentWeight = undefined;
    }
    
    const updatedPuppy = {
      ...localPuppy,
      weightLog: sortedWeightLog,
      currentWeight: newCurrentWeight
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    
    // Persist to database - we need the litterId, which we can get from the puppy's litter context
    // For now, we'll skip the database update since we don't have direct access to litterId
    // The parent component should handle persistence through onUpdate
    toast({
      title: "Weight Record Deleted",
      description: "The weight measurement has been removed."
    });
  }, [localPuppy, onUpdate]);

  const handleDeleteHeight = useCallback(async (index: number) => {
    const sortedHeightLog = [...(localPuppy.heightLog || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sortedHeightLog.splice(index, 1);
    
    const updatedPuppy = {
      ...localPuppy,
      heightLog: sortedHeightLog
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    
    toast({
      title: "Height Record Deleted",
      description: "The height measurement has been removed."
    });
  }, [localPuppy, onUpdate]);

  const handleDeleteNote = useCallback(async (index: number) => {
    const updatedNotes = [...(localPuppy.notes || [])];
    
    updatedNotes.splice(index, 1);
    
    const updatedPuppy = {
      ...localPuppy,
      notes: updatedNotes
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    
    toast({
      title: "Note Deleted",
      description: "The note has been removed."
    });
  }, [localPuppy, onUpdate]);

  return (
    <DialogContent className="sm:max-w-[600px]" onInteractOutside={onClose}>
      <DialogHeader>
        <DialogTitle>Measurements and notes for {puppy.name}</DialogTitle>
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
            onDeleteWeight={handleDeleteWeight}
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
            onDeleteHeight={handleDeleteHeight}
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
            onDeleteNote={handleDeleteNote}
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
