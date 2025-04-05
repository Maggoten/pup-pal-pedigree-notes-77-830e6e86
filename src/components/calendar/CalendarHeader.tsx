
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';

interface CalendarHeaderProps {
  currentDate: Date;
  startDate: Date;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  startDate,
  handlePrevWeek,
  handleNextWeek
}) => {
  return (
    <div className="flex flex-row items-center justify-between pb-2 bg-primary/5 border-b border-primary/20">
      <div>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CalendarIcon className="h-5 w-5" />
          Breeding Calendar
        </CardTitle>
        <CardDescription>
          Track heats, matings, and due dates
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </DialogTrigger>
        
        <Button variant="outline" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(startDate, 'MMM d')} - {format(addDays(startDate, 27), 'MMM d, yyyy')}
        </span>
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
