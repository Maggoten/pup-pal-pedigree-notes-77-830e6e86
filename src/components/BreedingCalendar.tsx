
import React from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';

const BreedingCalendar: React.FC = () => {
  const { dogs } = useDogs();
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent 
  } = useCalendarEvents(dogs);
  
  return (
    <Card className="border-primary/20 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
      <CalendarContent
        dogs={dogs}
        getEventsForDate={getEventsForDate}
        getEventColor={getEventColor}
        onDeleteEvent={deleteEvent}
        onAddEvent={addEvent}
        compact={false} // Set to false to make the calendar larger
      />
    </Card>
  );
};

export default BreedingCalendar;
