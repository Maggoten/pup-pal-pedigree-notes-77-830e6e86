import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';

interface EditLegacyHeatDialogProps {
  dogId: string;
  heatIndex: number;
  currentDate: string;
  onSuccess: () => void;
}

export const EditLegacyHeatDialog: React.FC<EditLegacyHeatDialogProps> = ({
  dogId,
  heatIndex,
  currentDate,
  onSuccess
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(currentDate));
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive"
      });
      return;
    }

    // Validate that the date is not in the future
    if (selectedDate > new Date()) {
      toast({
        title: "Invalid Date",
        description: "Heat date cannot be in the future",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await HeatService.editHeatEntry(dogId, heatIndex, selectedDate);
      
      if (success) {
        toast({
          title: "Success",
          description: "Heat entry updated successfully"
        });
        onSuccess();
        setOpen(false);
      } else {
        throw new Error('Failed to update heat entry');
      }
    } catch (error) {
      console.error('Error updating heat entry:', error);
      toast({
        title: "Error",
        description: "Failed to update heat entry",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Heat Date</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};