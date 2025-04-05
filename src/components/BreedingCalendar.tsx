
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';
import { CalendarIcon } from 'lucide-react';

const BreedingCalendar: React.FC = () => {
  const { dogs } = useDogs();
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent 
  } = useCalendarEvents(dogs);
  
  return (
    <Card className="border-primary/20 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <CalendarIcon className="h-5 w-5" />
          Breeding Calendar
        </CardTitle>
        <CardDescription>
          Track heats, matings, and due dates
        </CardDescription>
      </CardHeader>
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
