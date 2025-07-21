
import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddEventFormValues } from './calendar/types';
import CalendarContent from './calendar/CalendarContent';
import { useComprehensiveCalendarSync } from '@/hooks/useComprehensiveCalendarSync';
import { useTranslation } from 'react-i18next';

// Define props interface for calendar events data
interface CalendarEventsData {
  getEventsForDate: (date: Date) => any[];
  getEventColor: (type: string) => string;
  addEvent: (data: AddEventFormValues) => Promise<boolean> | boolean;
  deleteEvent: (eventId: string) => void;
  editEvent: (eventId: string, data: AddEventFormValues) => Promise<boolean> | boolean;
  isLoading: boolean;
  hasError: boolean;
  refreshEvents?: () => void;
}

interface BreedingCalendarProps {
  eventsData?: CalendarEventsData; // Optional because we might fetch data here
}

// Skeleton loader for calendar content
const CalendarSkeleton = ({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
    <span className="text-muted-foreground">{t('calendar.loading')}</span>
  </div>
);

// Use memo to prevent unnecessary re-renders
const BreedingCalendar: React.FC<BreedingCalendarProps> = memo(({ eventsData }) => {
  const { dogs } = useDogs();
  const { syncCalendar, isSyncing } = useComprehensiveCalendarSync();
  const { t } = useTranslation('home');
  
  // If no events data is provided, we need to fetch it - for backward compatibility
  // We'll use the provided eventsData directly from props if available
  const { 
    getEventsForDate, 
    getEventColor, 
    addEvent, 
    deleteEvent,
    editEvent,
    isLoading,
    hasError,
    refreshEvents
  } = eventsData || { 
    getEventsForDate: () => [], 
    getEventColor: () => '', 
    addEvent: () => false, 
    deleteEvent: () => {}, 
    editEvent: () => false, 
    isLoading: true, 
    hasError: false,
    refreshEvents: () => {}
  };
  
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

  const handleSyncCalendar = async () => {
    const success = await syncCalendar();
    if (success && refreshEvents) {
      // Force refresh calendar events after sync
      refreshEvents();
    }
  };
  
  return (
    <Card className="border-warmbeige-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-warmbeige-50 flex flex-col">
      <div className="flex flex-col">
        {isLoading ? (
          <CalendarSkeleton t={t} />
        ) : hasError ? (
          <div className="p-6 flex items-center justify-center">
            <Alert variant="destructive">
              <AlertDescription>
                {t('calendar.error')}
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
            onSyncCalendar={handleSyncCalendar}
            isSyncing={isSyncing}
          />
        )}
      </div>
    </Card>
  );
});

BreedingCalendar.displayName = 'BreedingCalendar';

export default BreedingCalendar;
