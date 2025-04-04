
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Thermometer, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemperatureLogProps {
  pregnancyId: string;
  femaleName: string;
}

interface TemperatureRecord {
  id: string;
  date: Date;
  temperature: number;
  notes?: string;
}

const TemperatureLog: React.FC<TemperatureLogProps> = ({ pregnancyId, femaleName }) => {
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [temperature, setTemperature] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  useEffect(() => {
    // Load temperature logs from localStorage
    const loadTemperatures = () => {
      const storedTemps = localStorage.getItem(`temperature_${pregnancyId}`);
      if (storedTemps) {
        const parsedTemps = JSON.parse(storedTemps);
        // Convert string dates to Date objects
        const processedTemps = parsedTemps.map((temp: any) => ({
          ...temp,
          date: new Date(temp.date)
        }));
        setTemperatures(processedTemps);
      }
    };
    
    loadTemperatures();
  }, [pregnancyId]);
  
  const saveTemperatures = (updatedTemps: TemperatureRecord[]) => {
    localStorage.setItem(`temperature_${pregnancyId}`, JSON.stringify(updatedTemps));
    setTemperatures(updatedTemps);
  };
  
  const handleAddTemperature = () => {
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
    
    const newRecord: TemperatureRecord = {
      id: Date.now().toString(),
      date: date,
      temperature: tempFloat,
      notes: notes.trim() || undefined
    };
    
    const updatedTemps = [...temperatures, newRecord];
    // Sort by date, newest first
    updatedTemps.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    saveTemperatures(updatedTemps);
    
    // Reset form
    setTemperature('');
    setNotes('');
    setDate(new Date());
    
    toast({
      title: "Temperature recorded",
      description: `Temperature of ${tempFloat}°F recorded for ${format(date, 'PPP')}.`
    });
  };
  
  const handleDeleteTemperature = (id: string) => {
    const updatedTemps = temperatures.filter(temp => temp.id !== id);
    saveTemperatures(updatedTemps);
    
    toast({
      title: "Temperature deleted",
      description: "The temperature record has been deleted."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Log</CardTitle>
        <CardDescription>Track {femaleName}'s body temperature</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
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
              onClick={handleAddTemperature} 
              className="w-full md:w-auto justify-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Temperature
            </Button>
          </div>
          
          {temperatures.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Temperature History</h3>
              <div className="space-y-3">
                {temperatures.map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-lg border p-3 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Thermometer className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{record.temperature}°F</span>
                          <span className="text-sm text-muted-foreground">
                            {format(record.date, 'PPP')}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemperature(record.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Thermometer className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Temperature Records</h3>
              <p className="text-muted-foreground mb-4">
                Start recording temperature to track changes
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureLog;
