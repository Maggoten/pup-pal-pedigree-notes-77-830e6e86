
import { useState, useEffect } from 'react';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { Dog } from '@/types/dogs';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { getSampleEvents } from '@/data/sampleCalendarEvents';
import { 
  fetchCalendarEvents, 
  addEventToSupabase, 
  updateEventInSupabase, 
  deleteEventFromSupabase,
  migrateCalendarEventsFromLocalStorage,
  getEventColor 
} from '@/services/CalendarEventService';
import { useAuth } from '@/context/AuthContext';

export const useCalendarEvents = (dogs: Dog[]) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Load events on component mount or when dependencies change
  useEffect(() => {
    const loadAllEvents = async () => {
      if (!user) {
        // Don't fetch if not authenticated
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Check if migration is needed (first time only)
        if (!hasMigrated) {
          await migrateCalendarEventsFromLocalStorage(dogs);
          setHasMigrated(true);
        }
        
        // Fetch custom events from Supabase
        const customEvents = await fetchCalendarEvents();
        
        // Get sample events (these are not stored in Supabase)
        const sampleEvents = getSampleEvents();
        
        // Calculate heat events based on dogs data
        const upcomingHeats = calculateUpcomingHeats(dogs);
        const heatEvents: CalendarEvent[] = upcomingHeats.map((heat, index) => ({
          id: `heat-${heat.dogId}-${index}`,
          title: 'Heat Cycle',
          date: heat.date,
          type: 'heat',
          dogId: heat.dogId,
          dogName: heat.dogName
        }));
        
        // Combine all events
        setCalendarEvents([...sampleEvents, ...heatEvents, ...customEvents]);
      } catch (error) {
        console.error("Error loading calendar events:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllEvents();
  }, [dogs, user, hasMigrated]);
  
  // Function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };
  
  // Function to add a new event
  const handleAddEvent = async (data: AddEventFormValues) => {
    if (!user) {
      return false;
    }
    
    const newEvent = await addEventToSupabase(data, dogs);
    
    if (newEvent) {
      setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
      return true;
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
    
    const updatedEvent = await updateEventInSupabase(eventId, data, dogs);
    
    if (updatedEvent) {
      setCalendarEvents(prevEvents => 
        prevEvents.map(event => event.id === eventId ? updatedEvent : event)
      );
      return true;
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
    
    const success = await deleteEventFromSupabase(eventId);
    
    if (success) {
      setCalendarEvents(prevEvents => 
        prevEvents.filter(event => event.id !== eventId)
      );
      return true;
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
    getEventColor
  };
};
