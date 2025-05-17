
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { dateToISOString, parseISODate } from '@/utils/dateUtils';

interface DatePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  label?: string;
  className?: string;
}

// Optimize DatePicker with React.memo to prevent unnecessary re-renders
const DatePicker: React.FC<DatePickerProps> = React.memo(({ 
  date, 
  setDate, 
  label, 
  className 
}) => {
  // Function to preserve the date without timezone shifts
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    // Create a new date with time set to noon to avoid timezone issues
    const newDate = new Date(selectedDate);
    newDate.setHours(12, 0, 0, 0);
    
    setDate(newDate);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white border-greige-300",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
