
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { AddEventFormValues } from '@/components/calendar/types';
import { getCalendarEvents, addEventToSupabase, updateEventInSupabase, deleteEventFromSupabase } from '@/services/CalendarEventService';
import { useDogs } from '@/context/DogsContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook to manage calendar events from Supabase
 * This replaces the localStorage-based useCalendarEvents hook
 */
const useSupabaseCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false); // Boolean flag for error state
  const { dogs } = useDogs();
  const { user } = useAuth();
  
  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('[Calendar] Fetching calendar events from Supabase');
      const fetchedEvents = await getCalendarEvents();
      console.log(`[Calendar] Fetched ${fetchedEvents.length} events from Supabase`);
      
      // Convert date strings to Date objects and ensure compatibility
      const processedEvents = fetchedEvents.map(event => ({
        ...event,
        // Ensure all events have both date and startDate/endDate fields for compatibility
        date: event.date,
        startDate: event.startDate || event.date,
        endDate: event.endDate || event.date,
      }));
      
      setEvents(processedEvents);
      setError(null);
      setHasError(false);
    } catch (err) {
      console.error('[Calendar] Error fetching calendar events:', err);
      setError(err as Error);
      setHasError(true);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // Changed from [user] to [user?.id] to prevent infinite loop

  // Initial fetch on mount and when user ID changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Add a new event
  const addEvent = async (eventData: AddEventFormValues): Promise<boolean> => {
    try {
      console.log('[Calendar] Adding new event:', eventData);
      const newEvent = await addEventToSupabase(eventData, dogs);
      
      if (newEvent) {
        // Update local state with the new event
        setEvents(prev => [...prev, {
          ...newEvent,
          // Ensure compatibility with both date systems
          date: newEvent.date,
          startDate: newEvent.startDate || newEvent.date,
          endDate: newEvent.endDate || newEvent.date
        }]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Calendar] Error adding event:', err);
      toast({
        title: 'Error',
        description: 'Failed to add event. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Update an existing event
  const updateEvent = async (eventId: string, eventData: AddEventFormValues): Promise<boolean> => {
    try {
      console.log('[Calendar] Updating event:', eventId, eventData);
      const updatedEvent = await updateEventInSupabase(eventId, eventData, dogs);
      
      if (updatedEvent) {
        // Update local state with the updated event
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? {
                ...event,
                ...updatedEvent,
                // Ensure compatibility with both date systems
                date: updatedEvent.date,
                startDate: updatedEvent.startDate || updatedEvent.date,
                endDate: updatedEvent.endDate || updatedEvent.date
              } 
            : event
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Calendar] Error updating event:', err);
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      console.log('[Calendar] Deleting event:', eventId);
      const success = await deleteEventFromSupabase(eventId);
      
      if (success) {
        // Remove from local state
        setEvents(prev => prev.filter(event => event.id !== eventId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Calendar] Error deleting event:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter(event => {
      // Use startDate if available, fall back to date for compatibility
      const eventDate = new Date(event.startDate || event.date);
      
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Force refresh events
  const refreshEvents = () => {
    fetchEvents();
  };

  return {
    events,
    isLoading,
    error,
    hasError,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay,
    refreshEvents: fetchEvents
  };
};

export default useSupabaseCalendarEvents;
