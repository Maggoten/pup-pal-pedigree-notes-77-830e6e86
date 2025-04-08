
import React from 'react';
import { format } from 'date-fns';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  currentDate: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  onAddEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  handlePrevMonth,
  handleNextMonth,
  onAddEvent
}) => {
  return (
    <div className="flex flex-row items-center justify-between p-4 pb-2 bg-greige-50 border-b border-greige-200">
      <div>
        <CardTitle className="flex items-center gap-2 text-primary text-xl">
          <CalendarIcon className="h-5 w-5" />
          Breeding Calendar
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          Track heats, matings, and due dates
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white/80 rounded-md border border-primary/10 px-2 py-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevMonth}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium px-2">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNextMonth}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={onAddEvent}>
          <Plus className="h-3 w-3" />
          Event
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
