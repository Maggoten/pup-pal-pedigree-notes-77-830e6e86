
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Puppy } from '@/types/breeding';
import { cn } from '@/lib/utils';

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

    const updatedPuppy = {
      ...puppy,
      weightLog: [
        ...puppy.weightLog,
        { date: measurementDate.toISOString(), weight: parseFloat(weight) }
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };

    onUpdate(updatedPuppy);
    setWeight('');
    
    toast({
      title: "Weight Recorded",
      description: `${puppy.name}'s weight has been recorded successfully.`
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

    const updatedPuppy = {
      ...puppy,
      heightLog: [
        ...puppy.heightLog,
        { date: measurementDate.toISOString(), height: parseFloat(height) }
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };

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
    const currentNotes = puppy.notes || [];

    const updatedPuppy = {
      ...puppy,
      notes: [
        ...currentNotes,
        { date: noteDate.toISOString(), content: note }
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };

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
        <div className="flex items-center space-x-4">
          <div className="grid gap-1.5 flex-1">
            <Label htmlFor="measurement-date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="measurement-time">Time</Label>
            <div className="flex items-center">
              <Input
                id="measurement-time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-24"
              />
              <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="height">Height</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight" className="space-y-4 mt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <div className="flex space-x-2">
                <Input
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="Enter weight"
                  className="flex-1"
                />
                <Button onClick={handleAddWeight}>Add</Button>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Weight Records</h3>
              {puppy.weightLog.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {puppy.weightLog.slice().reverse().slice(0, 5).map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                          <TableCell>{log.weight}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md text-muted-foreground">
                  No weight records yet
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="height" className="space-y-4 mt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="height">Height (cm)</Label>
              <div className="flex space-x-2">
                <Input
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="Enter height"
                  className="flex-1"
                />
                <Button onClick={handleAddHeight}>Add</Button>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Height Records</h3>
              {puppy.heightLog.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Height (cm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {puppy.heightLog.slice().reverse().slice(0, 5).map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                          <TableCell>{log.height}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md text-muted-foreground">
                  No height records yet
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="note">Add Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter a note about this puppy"
                rows={3}
              />
              <Button onClick={handleAddNote} className="mt-2">Add Note</Button>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Notes</h3>
              {puppy.notes && puppy.notes.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {puppy.notes.slice(0, 5).map((note, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {format(new Date(note.date), "PPP p")}
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md text-muted-foreground">
                  No notes yet
                </div>
              )}
            </div>
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

// Import the Table components here to avoid circular imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default PuppyMeasurementsDialog;
