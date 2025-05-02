
import { useState, useEffect, useCallback } from 'react';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { Dog } from '@/types/dogs';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { 
  fetchCalendarEvents, 
  addEventToSupabase, 
  updateEventInSupabase, 
  deleteEventFromSupabase,
  migrateCalendarEventsFromLocalStorage,
  getEventColor 
} from '@/services/CalendarEventService';
import { useAuth } from '@/hooks/useAuth';

export const useCalendarEvents = (dogs: Dog[]) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);
  const { user } = useAuth();
  
  // Consolidated fetch function with debouncing protection
  const fetchCalendarData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple rapid fetch requests (debounce)
    const now = Date.now();
    if (now - lastFetchTimestamp < 2000) {
      console.log("[Calendar] Debounced rapid calendar fetch request");
      return;
    }
    
    setLastFetchTimestamp(now);
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log("[Calendar] Loading calendar events for user:", user.id);
      
      // Only migrate once per session
      if (!hasMigrated) {
        await migrateCalendarEventsFromLocalStorage(dogs);
        setHasMigrated(true);
      }
      
      // Fetch custom events from Supabase
      const customEvents = await fetchCalendarEvents();
      console.log("[Calendar] Fetched custom events:", customEvents.length);
      
      // Generate heat events based on dogs data
      const upcomingHeats = calculateUpcomingHeats(dogs);
      const heatEvents: CalendarEvent[] = upcomingHeats.map((heat, index) => ({
        id: `heat-${heat.dogId}-${index}`,
        title: 'Heat Cycle',
        date: heat.date,
        type: 'heat',
        dogId: heat.dogId,
        dogName: heat.dogName
      }));
      console.log("[Calendar] Generated heat events:", heatEvents.length);
      
      // Set all events at once to prevent multiple renders
      setCalendarEvents([...heatEvents, ...customEvents]);
    } catch (error) {
      console.error("[Calendar] Error loading calendar events:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user, dogs, hasMigrated, lastFetchTimestamp]);
  
  // Initial fetch & refetch on dependencies change
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);
  
  // Function to get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  }, [calendarEvents]);
  
  // Function to add a new event
  const handleAddEvent = async (data: AddEventFormValues) => {
    if (!user) {
      return false;
    }
    
    try {
      const newEvent = await addEventToSupabase(data, dogs);
      
      if (newEvent) {
        setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
        return true;
      }
    } catch (error) {
      console.error("[Calendar] Error adding event:", error);
    }
    
    return false;
  };
  
  // Function to edit an event
  const handleEditEvent = async (eventId: string, data: AddEventFormValues) => {
    // Check if it's a custom event (only custom events can be edited)
    const eventToEdit = calendarEvents.find(event => event.id === eventId);
    
    if (!eventToEdit || eventToEdit.type !== 'custom') {
      return false;
    }
    
    try {
      const updatedEvent = await updateEventInSupabase(eventId, data, dogs);
      
      if (updatedEvent) {
        setCalendarEvents(prevEvents => 
          prevEvents.map(event => event.id === eventId ? updatedEvent : event)
        );
        return true;
      }
    } catch (error) {
      console.error("[Calendar] Error editing event:", error);
    }
    
    return false;
  };
  
  // Function to delete an event
  const handleDeleteEvent = async (eventId: string) => {
    // Check if it's a custom event (only custom events can be deleted)
    const eventToDelete = calendarEvents.find(event => event.id === eventId);
    
    if (!eventToDelete || eventToDelete.type !== 'custom') {
      return false;
    }
    
    try {
      const success = await deleteEventFromSupabase(eventId);
      
      if (success) {
        setCalendarEvents(prevEvents => 
          prevEvents.filter(event => event.id !== eventId)
        );
        return true;
      }
    } catch (error) {
      console.error("[Calendar] Error deleting event:", error);
    }
    
    return false;
  };
  
  return {
    calendarEvents,
    isLoading,
    hasError,
    getEventsForDate,
    addEvent: handleAddEvent,
    editEvent: handleEditEvent,
    deleteEvent: handleDeleteEvent,
    getEventColor,
    refreshCalendarData: fetchCalendarData
  };
};
