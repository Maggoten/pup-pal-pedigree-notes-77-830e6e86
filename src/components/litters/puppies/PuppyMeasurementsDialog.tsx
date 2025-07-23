import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import { updatePuppyInDb } from '@/services/puppyService';
import { supabase } from '@/integrations/supabase/client';
import { LitterService } from '@/services/LitterService';

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
  
  // Track if we're in the middle of an operation to prevent race conditions
  const isUpdating = useRef(false);
  const litterService = new LitterService();
  
  useEffect(() => {
    // Only update local state if we're not in the middle of an operation
    if (isUpdating.current) {
      console.log(`PuppyMeasurementsDialog: Skipping update during operation for ${puppy.name}`);
      return;
    }
    
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

    isUpdating.current = true;
    
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
    
    // Deduplicate existing weight logs before adding new one
    const existingLogs = localPuppy.weightLog || [];
    const deduplicatedLogs = existingLogs.filter((log, index, arr) => 
      arr.findIndex(l => l.date === log.date && l.weight === log.weight) === index
    );
    
    const updatedPuppy = {
      ...localPuppy,
      weightLog: [
        ...deduplicatedLogs,
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
    
    setTimeout(() => { isUpdating.current = false; }, 100);
    
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

    isUpdating.current = true;
    
    const measurementDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    measurementDate.setHours(hours, minutes);

    const heightValue = parseFloat(height);
    const newHeightRecord = { 
      date: measurementDate.toISOString(), 
      height: heightValue 
    };
    
    // Deduplicate existing height logs before adding new one
    const existingLogs = localPuppy.heightLog || [];
    const deduplicatedLogs = existingLogs.filter((log, index, arr) => 
      arr.findIndex(l => l.date === log.date && l.height === log.height) === index
    );
    
    const updatedPuppy = {
      ...localPuppy,
      heightLog: [
        ...deduplicatedLogs,
        newHeightRecord
      ]
    };

    setLocalPuppy(updatedPuppy);
    onUpdate(updatedPuppy);
    setHeight('');
    
    setTimeout(() => { isUpdating.current = false; }, 100);
    
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
    if (isUpdating.current) return;
    
    isUpdating.current = true;
    try {
      const sortedWeightLog = [...(localPuppy.weightLog || [])]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const weightLogToDelete = sortedWeightLog[index];
      if (!weightLogToDelete) return;
      
      // Find the corresponding database entry by date and weight
      const weightsQuery = await supabase
        .from('puppy_weight_logs')
        .select('id')
        .eq('puppy_id', localPuppy.id)
        .eq('date', weightLogToDelete.date)
        .eq('weight', weightLogToDelete.weight)
        .limit(1);
      
      if (weightsQuery.data && weightsQuery.data.length > 0) {
        const success = await litterService.deletePuppyWeightLog(weightsQuery.data[0].id);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to delete weight entry",
            variant: "destructive"
          });
          return;
        }
      }
      
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
      
      toast({
        title: "Weight Record Deleted",
        description: "The weight measurement has been removed."
      });
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast({
        title: "Error",
        description: "Failed to delete weight entry",
        variant: "destructive"
      });
    } finally {
      isUpdating.current = false;
    }
  }, [localPuppy, onUpdate, litterService]);

  const handleDeleteHeight = useCallback(async (index: number) => {
    if (isUpdating.current) return;
    
    isUpdating.current = true;
    try {
      const sortedHeightLog = [...(localPuppy.heightLog || [])]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const heightLogToDelete = sortedHeightLog[index];
      if (!heightLogToDelete) return;
      
      // Find the corresponding database entry by date and height
      const heightsQuery = await supabase
        .from('puppy_height_logs')
        .select('id')
        .eq('puppy_id', localPuppy.id)
        .eq('date', heightLogToDelete.date)
        .eq('height', heightLogToDelete.height)
        .limit(1);
      
      if (heightsQuery.data && heightsQuery.data.length > 0) {
        const success = await litterService.deletePuppyHeightLog(heightsQuery.data[0].id);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to delete height entry",
            variant: "destructive"
          });
          return;
        }
      }
      
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
    } catch (error) {
      console.error('Error deleting height:', error);
      toast({
        title: "Error",
        description: "Failed to delete height entry",
        variant: "destructive"
      });
    } finally {
      isUpdating.current = false;
    }
  }, [localPuppy, onUpdate, litterService]);

  const handleDeleteNote = useCallback(async (index: number) => {
    if (isUpdating.current) return;
    
    isUpdating.current = true;
    try {
      const updatedNotes = [...(localPuppy.notes || [])];
      const noteToDelete = updatedNotes[index];
      if (!noteToDelete) return;
      
      // Find the corresponding database entry by date and content
      const notesQuery = await supabase
        .from('puppy_notes')
        .select('id')
        .eq('puppy_id', localPuppy.id)
        .eq('date', noteToDelete.date)
        .eq('content', noteToDelete.content)
        .limit(1);
      
      if (notesQuery.data && notesQuery.data.length > 0) {
        const success = await litterService.deletePuppyNote(notesQuery.data[0].id);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to delete note",
            variant: "destructive"
          });
          return;
        }
      }
      
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
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    } finally {
      isUpdating.current = false;
    }
  }, [localPuppy, onUpdate, litterService]);

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
