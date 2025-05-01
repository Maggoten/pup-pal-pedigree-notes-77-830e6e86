
import React from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEventFormValues } from './calendar/types';

const BreedingCalendar: React.FC = () => {
  const { dogs } = useDogs();
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent,
    editEvent,
    isLoading,
    hasError
  } = useCalendarEvents(dogs);
  
  // Create wrapper functions that return boolean synchronously for UI feedback
  // but still trigger the async operations
  const handleAddEvent = (data: AddEventFormValues) => {
    addEvent(data)
      .catch(error => console.error('Error adding event:', error));
    return true; // Return true synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: AddEventFormValues) => {
    editEvent(eventId, data)
      .catch(error => console.error('Error editing event:', error));
    return true; // Return true synchronously for UI feedback
  };
  
  return (
    <Card className="border-greige-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full bg-greige-50">
      <div className="h-[600px]"> {/* Fixed height container to prevent layout shifts */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <span className="text-muted-foreground">Loading calendar events...</span>
          </div>
        ) : hasError ? (
          <div className="p-6 h-full flex items-center justify-center">
            <Alert variant="destructive">
              <AlertDescription>
                There was a problem loading your calendar events. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <CalendarContent
            dogs={dogs}
            getEventsForDate={getEventsForDate}
            getEventColor={getEventColor}
            onDeleteEvent={deleteEvent}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            compact={false} // Use full size calendar now
          />
        )}
      </div>
    </Card>
  );
};

export default BreedingCalendar;
