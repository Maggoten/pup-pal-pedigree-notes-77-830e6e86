
import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarContent from './calendar/CalendarContent';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEventFormValues } from './calendar/types';
import { Skeleton } from '@/components/ui/skeleton';

const BreedingCalendar: React.FC = () => {
  const { dogs } = useDogs();
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent,
    editEvent,
    isLoading,
    hasError,
    calendarEvents,
    refreshEvents
  } = useCalendarEvents(dogs);
  
  // Memoize the check for empty events to reduce unnecessary renders
  const hasEvents = useMemo(() => {
    return calendarEvents.length > 0;
  }, [calendarEvents]);
  
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
      <div className="h-[600px] relative"> {/* Fixed height container to prevent layout shifts */}
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <span className="text-muted-foreground">Loading calendar events...</span>
          </div>
        ) : hasError ? (
          <div className="absolute inset-0 p-6 flex items-center justify-center">
            <Alert variant="destructive">
              <AlertDescription>
                There was a problem loading your calendar events. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {/* Show the calendar content even when loading to maintain layout */}
            <div className="absolute inset-0" style={{ 
              opacity: isLoading ? 0 : 1, 
              transition: 'opacity 0.3s ease-in-out'
            }}>
              <CalendarContent
                dogs={dogs}
                getEventsForDate={getEventsForDate}
                getEventColor={getEventColor}
                onDeleteEvent={deleteEvent}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                compact={false} // Use full size calendar
                hasEvents={hasEvents}
              />
            </div>
            
            {/* Add skeleton when loading to maintain structure */}
            {isLoading && (
              <div className="absolute inset-0 p-4">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {Array(7).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(35).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default BreedingCalendar;
