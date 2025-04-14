
import React from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';
import { AddEventFormValues } from './calendar/types';

const BreedingCalendar: React.FC = () => {
  const { dogs } = useDogs();
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent,
    editEvent
  } = useCalendarEvents(dogs);
  
  // Wrapper functions to match expected return types
  const handleAddEvent = (data: AddEventFormValues): boolean => {
    // Set default type as 'custom' if not provided
    const eventData = {
      ...data,
      type: data.type || 'custom'
    };
    
    addEvent(eventData);
    return true; // Return boolean as expected by CalendarContent
  };
  
  const handleEditEvent = (eventId: string, data: AddEventFormValues): boolean => {
    // Preserve the type if not provided in update
    const eventData = {
      ...data,
      type: data.type || 'custom'
    };
    
    editEvent(eventId, eventData);
    return true; // Return boolean as expected by CalendarContent
  };
  
  return (
    <Card className="border-greige-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full bg-greige-50">
      <CalendarContent
        dogs={dogs}
        getEventsForDate={getEventsForDate}
        getEventColor={getEventColor}
        onDeleteEvent={deleteEvent}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        compact={false} // Use full size calendar now
      />
    </Card>
  );
};

export default BreedingCalendar;
