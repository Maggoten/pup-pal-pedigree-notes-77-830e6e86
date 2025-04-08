
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
    deleteEvent,
    editEvent
  } = useCalendarEvents(dogs);
  
  return (
    <Card className="border-primary/20 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <CalendarContent
        dogs={dogs}
        getEventsForDate={getEventsForDate}
        getEventColor={getEventColor}
        onDeleteEvent={deleteEvent}
        onAddEvent={addEvent}
        onEditEvent={editEvent}
        compact={false} // Use full size calendar now
      />
    </Card>
  );
};

export default BreedingCalendar;
