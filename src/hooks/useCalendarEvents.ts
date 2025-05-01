
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
    let isMounted = true;
    let loadingTimer: ReturnType<typeof setTimeout>;
    
    const loadAllEvents = async () => {
      if (!user) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }
      
      // Only set loading state after a short delay to prevent flickering
      loadingTimer = setTimeout(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      }, 300);
      
      setHasError(false);
      
      try {
        // Generate sample events while waiting for backend
        const sampleEvents = getSampleEvents();
        const upcomingHeats = calculateUpcomingHeats(dogs);
        const heatEvents: CalendarEvent[] = upcomingHeats.map((heat, index) => ({
          id: `heat-${heat.dogId}-${index}`,
          title: 'Heat Cycle',
          date: heat.date,
          type: 'heat',
          dogId: heat.dogId,
          dogName: heat.dogName
        }));
        
        // Set initial data quickly to prevent flickering
        if (isMounted) {
          setCalendarEvents([...sampleEvents, ...heatEvents]);
        }
        
        // Check if migration is needed (first time only)
        if (!hasMigrated) {
          try {
            await migrateCalendarEventsFromLocalStorage(dogs);
            if (isMounted) {
              setHasMigrated(true);
            }
          } catch (migrationErr) {
            console.error("Migration error (non-critical):", migrationErr);
          }
        }
        
        // Fetch custom events from Supabase
        try {
          const customEvents = await fetchCalendarEvents();
          
          // Update with complete data
          if (isMounted) {
            setCalendarEvents(prev => {
              const nonCustomEvents = prev.filter(event => event.type !== 'custom');
              return [...nonCustomEvents, ...customEvents];
            });
          }
        } catch (fetchErr) {
          console.error("Error fetching custom events:", fetchErr);
          // Don't set error state here - we still have sample data
        }
      } catch (error) {
        console.error("Error loading calendar events:", error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        clearTimeout(loadingTimer);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadAllEvents();
    
    return () => {
      isMounted = false;
      clearTimeout(loadingTimer);
    };
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
