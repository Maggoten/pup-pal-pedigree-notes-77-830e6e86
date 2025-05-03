
import React, { memo, Suspense, lazy, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEventFormValues } from './calendar/types';

// Lazy load the calendar content for better performance
const CalendarContent = lazy(() => import('./calendar/CalendarContent'));

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

// Skeleton loader for calendar content
const CalendarSkeleton = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
    <span className="text-muted-foreground">Loading calendar...</span>
  </div>
);

// Use memo to prevent unnecessary re-renders
const BreedingCalendar: React.FC<BreedingCalendarProps> = memo(({ eventsData }) => {
  const { dogs } = useDogs();
  const [showLoading, setShowLoading] = useState(true);
  
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
  } = eventsData || { 
    getEventsForDate: () => [], 
    getEventColor: () => '', 
    addEvent: () => false, 
    deleteEvent: () => {}, 
    editEvent: () => false, 
    isLoading: true, 
    hasError: false 
  };
  
  // Debug logging for calendar events
  useEffect(() => {
    const today = new Date();
    const eventsForToday = getEventsForDate(today);
    console.log(`Calendar events for today (${today.toDateString()}):`, eventsForToday);
    
    // Log vaccination events
    const vaccinationEvents = eventsForToday.filter(e => e.type === 'vaccination');
    console.log(`Vaccination events for today:`, vaccinationEvents);
  }, [getEventsForDate]);
  
  // Force show content after a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Forcing calendar to show after timeout");
        setShowLoading(false);
      }
    }, 3000);
    
    // If not loading, immediately show content
    if (!isLoading) {
      setShowLoading(false);
    }
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
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
    <Card className="border-warmbeige-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-warmbeige-50 flex flex-col">
      <div className="flex flex-col">
        {showLoading ? (
          <CalendarSkeleton />
        ) : hasError ? (
          <div className="p-6 flex items-center justify-center">
            <Alert variant="destructive">
              <AlertDescription>
                There was a problem loading your calendar events. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Suspense fallback={<CalendarSkeleton />}>
            <CalendarContent
              dogs={dogs}
              getEventsForDate={getEventsForDate}
              getEventColor={getEventColor}
              onDeleteEvent={deleteEvent}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              compact={false} // Use full size calendar now
            />
          </Suspense>
        )}
      </div>
    </Card>
  );
});

BreedingCalendar.displayName = 'BreedingCalendar';

export default BreedingCalendar;
