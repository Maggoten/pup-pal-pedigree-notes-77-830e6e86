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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBreedingReminders } from '@/hooks/reminders';
import { format, isValid } from 'date-fns';
import { getNormalizedToday } from '@/utils/dateUtils';

export const useCalendarEvents = (dogs: Dog[]) => {
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { reminders } = useBreedingReminders();
  
  // Handle migration once per session
  const migrateEventsIfNeeded = useCallback(async () => {
    if (!hasMigrated && user) {
      console.log("[Calendar] Starting data migration check...");
      await migrateCalendarEventsFromLocalStorage(dogs);
      setHasMigrated(true);
      console.log("[Calendar] Migration completed");
    }
  }, [hasMigrated, user, dogs]);
  
  // Convert reminders to calendar events
  const reminderToCalendarEvents = useCallback(() => {
    if (!reminders || reminders.length === 0) {
      console.log("[Calendar] No reminders to convert to calendar events");
      return [];
    }
    
    console.log("[Calendar] Converting reminders to calendar events:", reminders.length);
    
    const eventsList = reminders.map(reminder => {
      const dueDate = reminder.dueDate;
      if (!dueDate || !isValid(dueDate)) {
        console.error(`[Calendar] Invalid due date for reminder: ${reminder.id} - ${reminder.title}`);
        return null;
      }
      
      console.log(`[Calendar] Converting reminder: ${reminder.id} - ${reminder.title} - type: ${reminder.type} - due: ${dueDate.toISOString()}`);
      
      return {
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date: dueDate,
        type: reminder.type,
        dogId: reminder.relatedId,
        dogName: "", // We'll try to add the dog name below
        time: format(dueDate, 'HH:mm'),
        notes: reminder.description,
        isCompleted: reminder.isCompleted,
        priority: reminder.priority
      };
    }).filter(event => event !== null) as CalendarEvent[]; // Filter out any null entries
    
    // Add dog names where possible
    eventsList.forEach(event => {
      if (event.dogId) {
        const dog = dogs.find(d => d.id === event.dogId);
        if (dog) {
          event.dogName = dog.name;
        }
      }
    });
    
    // Log vaccination reminders specifically for debugging
    const vacEvents = eventsList.filter(e => e.type === 'vaccination');
    console.log(`[Calendar] Found ${vacEvents.length} vaccination calendar events`);
    vacEvents.forEach(e => {
      console.log(`[Calendar] Vaccination event: ${e.title}, Due: ${new Date(e.date).toISOString()}, Dog: ${e.dogName}`);
    });
    
    console.log(`[Calendar] Converted ${eventsList.length} reminders to calendar events`);
    return eventsList;
  }, [reminders, dogs]);
  
  // Use React Query for calendar events - Fixed for v5 compatibility
  const { 
    data: calendarEvents = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['calendar-events', user?.id, dogs.length, reminders?.length],
    queryFn: async () => {
      if (!user) {
        console.log("[Calendar] No user found, returning empty events array");
        return [];
      }
      
      console.log("[Calendar] Loading calendar events for user:", user.id);
      console.log("[Calendar] Dogs data:", dogs.map(d => ({id: d.id, name: d.name})));
      console.log("[Calendar] Reminders data:", reminders?.length || 0, "reminders available");
      
      try {
        // Ensure migration happens before fetching
        await migrateEventsIfNeeded();
        
        // Fetch custom events from Supabase
        const customEvents = await fetchCalendarEvents();
        console.log("[Calendar] Fetched custom events:", customEvents.length);
        
        // Generate heat events based on dogs data - now showing past events as well
        const heatEvents: CalendarEvent[] = calculateUpcomingHeats(dogs, 6, 24).map((heat, index) => ({
          id: `heat-${heat.dogId}-${index}-${Date.now()}`, // Add timestamp for uniqueness
          title: 'Heat Cycle',
          date: heat.date,
          type: 'heat',
          dogId: heat.dogId,
          dogName: heat.dogName
        }));
        console.log("[Calendar] Generated heat events:", heatEvents.length);
        
        // Get reminder events
        const reminderEvents = reminderToCalendarEvents();
        console.log("[Calendar] Generated reminder events:", reminderEvents.length);
        
        // Log all vaccination events for debugging
        const vaccinationEvents = reminderEvents.filter(e => e.type === 'vaccination');
        console.log(`[Calendar] Vaccination events (${vaccinationEvents.length}):`, 
          vaccinationEvents.map(e => `${e.title} - ${new Date(e.date).toISOString()} - Dog ID: ${e.dogId}`));
        
        // Return all events at once
        const allEvents = [...heatEvents, ...customEvents, ...reminderEvents];
        console.log("[Calendar] Total events:", allEvents.length);
        return allEvents;
      } catch (error) {
        console.error("[Calendar] Error generating calendar events:", error);
        // Return custom events at minimum
        const customEvents = await fetchCalendarEvents();
        return customEvents;
      }
    },
    enabled: !!user, // Enable when user is available, even if dogs are not yet loaded
    staleTime: 1000 * 30, // Consider data fresh for just 30 seconds to ensure frequent updates
    retry: 2, // Increased retry attempts
    refetchOnMount: true,
    refetchOnWindowFocus: true // Enable refetching when window regains focus
  });
  
  // Force a refresh when dogs or reminders change
  useEffect(() => {
    if (user) {
      console.log("[Calendar] Force refreshing calendar events after dogs or reminders updated");
      refetch();
    }
  }, [user, dogs.length, reminders?.length, refetch]);
  
  // Memoize getEventsForDate to reduce re-renders
  const getEventsForDate = useCallback((date: Date) => {
    if (!calendarEvents || !Array.isArray(calendarEvents)) {
      console.log("[Calendar] No calendar events available");
      return [];
    }
    
    // Normalize comparison dates to avoid time issues
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    const eventsForDate = calendarEvents.filter(event => {
      if (!event || !event.date) return false;
      
      // Convert event.date to string for comparison if it's a Date object
      let eventDateStr: string;
      
      if (event.date instanceof Date) {
        eventDateStr = event.date.toISOString().split('T')[0];
      } else if (typeof event.date === 'string') {
        // Handle ISO string directly
        eventDateStr = event.date.split('T')[0];
      } else {
        // Handle date that's not a Date or string - more robust handling
        try {
          // First try to create a new Date object
          const eventDate = new Date(event.date as any);
          if (isValid(eventDate)) {
            eventDateStr = eventDate.toISOString().split('T')[0];
          } else {
            // If we can't create a valid date, log the issue and skip this event
            console.error(`[Calendar] Invalid date format:`, event.date);
            return false;
          }
        } catch (err) {
          console.error(`[Calendar] Error converting event date:`, event.date, err);
          return false;
        }
      }
      
      return eventDateStr === targetDateStr;
    });
    
    const today = getNormalizedToday();
    if (date.toDateString() === today.toDateString()) {
      console.log("[Calendar] Events for today:", eventsForDate);
      
      // Specifically log vaccination events for today
      const vacEvents = eventsForDate.filter(e => e.type === 'vaccination');
      if (vacEvents.length > 0) {
        console.log("[Calendar] Vaccination events for today:", 
          vacEvents.map(e => `${e.title} (Dog: ${e.dogName})`));
      } else {
        console.log("[Calendar] No vaccination events for today");
      }
    }
    
    return eventsForDate;
  }, [calendarEvents]);
  
  // Add event mutation - Fixed for v5 compatibility
  const addEventMutation = useMutation({
    mutationFn: async (data: AddEventFormValues) => {
      if (!user) throw new Error('User not authenticated');
      return await addEventToSupabase(data, dogs);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
      
      // No optimistic update because we need the server-generated ID
      return { submitted: true };
    },
    onError: (error) => {
      console.error("[Calendar] Error adding event:", error);
    },
    onSuccess: () => {
      console.log("[Calendar] Event added successfully");
    },
    onSettled: () => {
      // Always refetch after mutation completes
      queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    }
  });
  
  // Edit event mutation - Fixed for v5 compatibility
  const editEventMutation = useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string, data: AddEventFormValues }) => {
      return await updateEventInSupabase(eventId, data, dogs);
    },
    onMutate: async ({ eventId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
      
      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(['calendar-events', user?.id, dogs.length]);
      
      // Optimistically update
      queryClient.setQueryData(['calendar-events', user?.id, dogs.length], (oldEvents: CalendarEvent[] = []) => {
        return oldEvents.map(event => {
          if (event.id === eventId && event.type === 'custom') {
            return { 
              ...event,
              title: data.title,
              date: data.date,
              time: data.time,
              notes: data.notes,
              dogId: data.dogId
            };
          }
          return event;
        });
      });
      
      return { previousEvents };
    },
    onError: (err, { eventId }, context) => {
      console.error(`[Calendar] Error editing event ${eventId}:`, err);
      // Rollback to the snapshot on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['calendar-events', user?.id, dogs.length], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    }
  });
  
  // Delete event mutation - Fixed for v5 compatibility
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await deleteEventFromSupabase(eventId);
    },
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
      
      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(['calendar-events', user?.id, dogs.length]);
      
      // Optimistically update
      queryClient.setQueryData(['calendar-events', user?.id, dogs.length], (oldEvents: CalendarEvent[] = []) => {
        return oldEvents.filter(event => !(event.id === eventId && event.type === 'custom'));
      });
      
      return { previousEvents };
    },
    onError: (err, eventId, context) => {
      console.error(`[Calendar] Error deleting event ${eventId}:`, err);
      // Rollback to the snapshot on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['calendar-events', user?.id, dogs.length], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    }
  });
  
  // Wrapper functions
  const handleAddEvent = async (data: AddEventFormValues): Promise<boolean> => {
    try {
      await addEventMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  };
  
  const handleEditEvent = async (eventId: string, data: AddEventFormValues): Promise<boolean> => {
    // Check if it's a custom event (only custom events can be edited)
    const eventToEdit = calendarEvents?.find(event => event.id === eventId);
    if (!eventToEdit || eventToEdit.type !== 'custom') {
      return false;
    }
    
    try {
      await editEventMutation.mutateAsync({ eventId, data });
      return true;
    } catch {
      return false;
    }
  };
  
  const handleDeleteEvent = async (eventId: string): Promise<boolean> => {
    // Check if it's a custom event (only custom events can be deleted)
    const eventToDelete = calendarEvents?.find(event => event.id === eventId);
    if (!eventToDelete || eventToDelete.type !== 'custom') {
      return false;
    }
    
    try {
      await deleteEventMutation.mutateAsync(eventId);
      return true;
    } catch {
      return false;
    }
  };
  
  // Manual refresh function
  const refreshCalendarData = useCallback(() => {
    console.log("[Calendar] Manually refreshing calendar events");
    queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    refetch();
  }, [queryClient, user, dogs.length, refetch]);
  
  // Error handling
  const hasError = !!fetchError;
  
  return {
    calendarEvents: calendarEvents || [],
    isLoading,
    hasError,
    getEventsForDate,
    addEvent: handleAddEvent,
    editEvent: handleEditEvent,
    deleteEvent: handleDeleteEvent,
    getEventColor,
    refreshCalendarData
  };
};
