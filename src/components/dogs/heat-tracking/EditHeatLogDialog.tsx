import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface EditHeatLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatLog: HeatLog;
  onSuccess: () => void;
}

const HEAT_PHASES = [
  { value: 'proestrus', label: 'Proestrus' },
  { value: 'estrus', label: 'Estrus' },
  { value: 'metestrus', label: 'Metestrus' },
  { value: 'anestrus', label: 'Anestrus' }
];

const EditHeatLogDialog: React.FC<EditHeatLogDialogProps> = ({ 
  open, 
  onOpenChange, 
  heatLog,
  onSuccess 
}) => {
  const { t } = useTranslation('dogs');
  const [date, setDate] = useState<Date>();
  const [temperature, setTemperature] = useState('');
  const [phase, setPhase] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with existing data when dialog opens
  useEffect(() => {
    if (open && heatLog) {
      setDate(parseISO(heatLog.date));
      setTemperature(heatLog.temperature ? heatLog.temperature.toString() : '');
      setPhase(heatLog.phase || '');
      setObservations(heatLog.observations || '');
      setNotes(heatLog.notes || '');
    }
  }, [open, heatLog]);

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: 'Date Required',
        description: 'Please select a date for this log entry.',
        variant: 'destructive',
      });
      return;
    }

    // Validate date is not in the future
    if (date > new Date()) {
      toast({
        title: 'Invalid Date',
        description: 'Date cannot be in the future.',
        variant: 'destructive',
      });
      return;
    }

    // Validate temperature if provided
    const tempValue = temperature ? parseFloat(temperature) : undefined;
    if (temperature && (isNaN(tempValue!) || tempValue! < 30 || tempValue! > 45)) {
      toast({
        title: 'Invalid Temperature',
        description: 'Please enter a valid temperature between 30°C and 45°C.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedLog = await HeatService.updateHeatLog(heatLog.id, {
        date: date.toISOString(),
        temperature: tempValue,
        phase: phase || undefined,
        observations: observations || undefined,
        notes: notes || undefined
      });

      if (updatedLog) {
        toast({
          title: 'Log Updated',
          description: 'Heat log entry has been updated successfully.',
        });
        onSuccess();
      } else {
        throw new Error('Failed to update heat log');
      }
    } catch (error) {
      console.error('Error updating heat log:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update the heat log entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Heat Log Entry</DialogTitle>
          <DialogDescription>
            Update the details for this heat log entry.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="30"
              max="45"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g., 38.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Heat Phase</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Select heat phase" />
              </SelectTrigger>
              <SelectContent>
                {HEAT_PHASES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Behavioral changes, physical signs, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !date}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHeatLogDialog;