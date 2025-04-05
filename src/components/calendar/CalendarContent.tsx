
import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';
import { Dialog } from '@/components/ui/dialog';
import AddEventDialog from './AddEventDialog';
import { Dog } from '@/context/DogsContext';
import { AddEventFormValues } from './types';

interface CalendarContentProps {
  dogs: Dog[];
  getEventsForDate: (date: Date) => any[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (data: AddEventFormValues) => boolean;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  dogs,
  getEventsForDate,
  getEventColor,
  onDeleteEvent,
  onAddEvent
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  // On mobile, we show 2 weeks at a time instead of 4 to make it more readable
  const weeksToShow = isMobile ? 2 : 4;
  
  const calendarDays = Array.from({ length: weeksToShow * 7 }, (_, index) => {
    return addDays(startDate, index);
  });
  
  const weeks = Array.from({ length: weeksToShow }, (_, weekIndex) => {
    return calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
  });
  
  const handleSubmit = (data: AddEventFormValues) => {
    const success = onAddEvent(data);
    if (success) {
      setIsDialogOpen(false);
    }
    return success;
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <CalendarHeader 
        currentDate={currentDate}
        startDate={startDate}
        handlePrevWeek={handlePrevWeek}
        handleNextWeek={handleNextWeek}
      />
      
      <CardContent className="p-4 bg-gradient-to-br from-cream-50 to-[#FFDEE2]/30">
        <div className="text-xs text-gray-500 mb-2">
          {isMobile 
            ? "Tap custom events to view details and delete option" 
            : "Right-click on custom events to delete them"}
        </div>
        <div className={isMobile ? "overflow-x-auto -mx-4 px-4" : ""}>
          <CalendarGrid 
            weeks={weeks}
            getEventsForDate={getEventsForDate}
            getEventColor={getEventColor}
            onDeleteEvent={onDeleteEvent}
          />
        </div>
      </CardContent>
      
      <AddEventDialog dogs={dogs} onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default CalendarContent;
