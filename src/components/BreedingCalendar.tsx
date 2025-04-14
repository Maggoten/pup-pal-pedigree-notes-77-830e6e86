
import React from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';
import { CalendarEvent } from './calendar/types';
import { AddEventFormValues } from './calendar/types';

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
    
    // Handler for adding events that returns boolean as required by CalendarContent
    const handleAddEvent = (data: AddEventFormValues): boolean => {
      try {
        addEvent({
          ...data,
          type: data.type || 'custom'
        });
        return true;
      } catch (error) {
        console.error('Error adding event:', error);
        return false;
      }
    };
    
    // Handler for editing events that returns boolean as required by CalendarContent
    const handleEditEvent = (eventId: string, data: AddEventFormValues): boolean => {
      try {
        const eventToUpdate = getEventsForDate(data.date).find(event => event.id === eventId);
        if (!eventToUpdate) return false;
        
        editEvent({
          ...eventToUpdate,
          ...data,
          id: eventId,
          type: eventToUpdate.type
        });
        return true;
      } catch (error) {
        console.error('Error editing event:', error);
        return false;
      }
    };
    
    return (
      <Card className="border-greige-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full bg-greige-50">
        <CalendarContent
          dogs={dogs || []}
          getEventsForDate={getEventsForDate}
          getEventColor={getEventColor}
          onDeleteEvent={deleteEvent}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
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
