
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
    <Card className="border-primary/20 overflow-hidden shadow-sm">
      <CalendarContent
        dogs={dogs}
        getEventsForDate={getEventsForDate}
        getEventColor={getEventColor}
        onDeleteEvent={deleteEvent}
        onAddEvent={addEvent}
      />
    </Card>
  );
};

export default BreedingCalendar;
