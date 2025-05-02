
import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import CalendarContent from './calendar/CalendarContent';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEventFormValues } from './calendar/types';

// Define props interface for calendar events data
interface CalendarEventsData {
  getEventsForDate: (date: Date) => any[];
  getEventColor: (type: string) => string;
  addEvent: (data: AddEventFormValues) => Promise<boolean> | boolean;
  deleteEvent: (eventId: string) => void;
  editEvent: (eventId: string, data: AddEventFormValues) => Promise<boolean> | boolean;
  isLoading: boolean;
  hasError: boolean;
}

interface BreedingCalendarProps {
  eventsData?: CalendarEventsData; // Optional because we might fetch data here
}

// Use memo to prevent unnecessary re-renders
const BreedingCalendar: React.FC<BreedingCalendarProps> = memo(({ eventsData }) => {
  const { dogs } = useDogs();
  
  // If no events data is provided, we need to fetch it - for backward compatibility
  // We'll use the provided eventsData directly from props if available
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent,
    editEvent,
    isLoading,
    hasError
  } = eventsData || { getEventsForDate: () => [], getEventColor: () => '', addEvent: () => false, deleteEvent: () => {}, editEvent: () => false, isLoading: true, hasError: false };
  
  // Create wrapper functions to handle the async nature of the original functions
  const handleAddEvent = (data: AddEventFormValues) => {
    const result = addEvent(data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch(err => {
        console.error("Error adding event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: AddEventFormValues) => {
    const result = editEvent(eventId, data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch(err => {
        console.error("Error editing event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  return (
    <Card className="border-greige-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full bg-greige-50 flex flex-col">
      <div className="h-full flex flex-col flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 flex-grow">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <span className="text-muted-foreground">Loading calendar events...</span>
          </div>
        ) : hasError ? (
          <div className="p-6 h-full flex items-center justify-center flex-grow">
            <Alert variant="destructive">
              <AlertDescription>
                There was a problem loading your calendar events. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="h-full flex-grow">
            <CalendarContent
              dogs={dogs}
              getEventsForDate={getEventsForDate}
              getEventColor={getEventColor}
              onDeleteEvent={deleteEvent}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              compact={false} // Use full size calendar now
            />
          </div>
        )}
      </div>
    </Card>
  );
});

BreedingCalendar.displayName = 'BreedingCalendar';

export default BreedingCalendar;
