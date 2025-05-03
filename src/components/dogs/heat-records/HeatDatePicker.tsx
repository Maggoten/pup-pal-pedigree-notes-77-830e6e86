
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { parseISODate, dateToISOString } from '@/utils/dateUtils';

interface HeatDatePickerProps {
  date: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
}

const HeatDatePicker: React.FC<HeatDatePickerProps> = ({ 
  date, 
  onSelect, 
  disabled 
}) => {
  // Function to preserve the date without timezone shifts
  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    // Create a new date with time set to noon to avoid timezone issues
    const newDate = new Date(selectedDate);
    newDate.setHours(12, 0, 0, 0);
    
    onSelect(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};

export default HeatDatePicker;
