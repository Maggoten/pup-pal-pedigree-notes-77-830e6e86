
import React from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';

const BreedingCalendar: React.FC = () => {
  const { dogs } = useDogs();
  
  // Add error handling for useCalendarEvents
  try {
    const { 
      getEventsForDate, 
      getEventColor, 
      addEvent, 
      deleteEvent,
      editEvent
    } = useCalendarEvents(dogs || []);
    
    return (
      <Card className="border-greige-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full bg-greige-50">
        <CalendarContent
          dogs={dogs || []}
          getEventsForDate={getEventsForDate}
          getEventColor={getEventColor}
          onDeleteEvent={deleteEvent}
          onAddEvent={addEvent}
          onEditEvent={editEvent}
          compact={false} // Use full size calendar now
        />
      </Card>
    );
  } catch (error) {
    console.error('Error loading calendar:', error);
    return (
      <Card className="border-greige-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full bg-greige-50 p-4">
        <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
          <p className="text-muted-foreground">Unable to load calendar data</p>
        </div>
      </Card>
    );
  }
};

export default BreedingCalendar;
