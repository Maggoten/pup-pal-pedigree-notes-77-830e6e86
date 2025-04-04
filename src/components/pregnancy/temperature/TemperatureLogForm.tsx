
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemperatureRecord } from '../temperature/types';

interface TemperatureLogFormProps {
  onAddTemperature: (record: Omit<TemperatureRecord, 'id'>) => void;
}

const TemperatureLogForm: React.FC<TemperatureLogFormProps> = ({ onAddTemperature }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [temperature, setTemperature] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    if (!temperature) {
      toast({
        title: "Temperature required",
        description: "Please enter a temperature value.",
        variant: "destructive"
      });
      return;
    }
    
    const tempFloat = parseFloat(temperature);
    if (isNaN(tempFloat)) {
      toast({
        title: "Invalid temperature",
        description: "Please enter a valid temperature value.",
        variant: "destructive"
      });
      return;
    }
    
    onAddTemperature({
      date,
      temperature: tempFloat,
      notes: notes.trim() || undefined
    });
    
    // Reset form
    setTemperature('');
    setNotes('');
    setDate(new Date());
  };

  return (
    <div className="grid gap-4 py-4 border rounded-lg p-4 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="e.g. 101.5"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional observations..."
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full md:w-auto justify-center"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Temperature
      </Button>
    </div>
  );
};

export default TemperatureLogForm;
