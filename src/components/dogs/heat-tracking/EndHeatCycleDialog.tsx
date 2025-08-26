import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface EndHeatCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatCycle: HeatCycle;
  onSuccess: () => void;
}

const EndHeatCycleDialog: React.FC<EndHeatCycleDialogProps> = ({ 
  open, 
  onOpenChange, 
  heatCycle,
  onSuccess 
}) => {
  const { t } = useTranslation('dogs');
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const startDate = parseISO(heatCycle.start_date);

  const handleSubmit = async () => {
    if (!endDate) {
      toast({
        title: 'Date Required',
        description: 'Please select an end date for this heat cycle.',
        variant: 'destructive',
      });
      return;
    }

    // Validate end date is not before start date
    if (endDate < startDate) {
      toast({
        title: 'Invalid Date',
        description: 'End date cannot be before the start date.',
        variant: 'destructive',
      });
      return;
    }

    // Validate end date is not in the future
    if (endDate > new Date()) {
      toast({
        title: 'Invalid Date',
        description: 'End date cannot be in the future.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedCycle = await HeatService.endHeatCycle(heatCycle.id, endDate);
      if (updatedCycle) {
        toast({
          title: 'Heat Cycle Ended',
          description: 'The heat cycle has been marked as completed.',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to end heat cycle');
      }
    } catch (error) {
      console.error('Error ending heat cycle:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to end the heat cycle. Please try again.',
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
          <DialogTitle>End Heat Cycle</DialogTitle>
          <DialogDescription>
            Mark this heat cycle as completed by setting an end date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p><strong>Heat cycle started:</strong> {format(startDate, 'MMMM dd, yyyy')}</p>
            <p><strong>Current duration:</strong> {Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  disabled={(date) => date > new Date() || date < startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Select the date when the heat cycle ended. This cannot be before the start date or in the future.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !endDate}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            End Heat Cycle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EndHeatCycleDialog;