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
import { format } from 'date-fns';

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
    if (!reminders || reminders.length === 0) return [];
    
    console.log("[Calendar] Converting reminders to calendar events:", reminders.length);
    
    const eventsList = reminders.map(reminder => {
      console.log(`[Calendar] Converting reminder: ${reminder.id} - ${reminder.title} - type: ${reminder.type}`);
      return {
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date: reminder.dueDate,
        type: reminder.type,
        dogId: reminder.relatedId,
        dogName: "", // We'll try to add the dog name below
        time: format(reminder.dueDate, 'HH:mm'),
        notes: reminder.description,
        isCompleted: reminder.isCompleted,
        priority: reminder.priority
      };
    });
    
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
  
  // Use React Query for calendar events
  const { 
    data: calendarEvents = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['calendar-events', user?.id, dogs.length, reminders.length],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("[Calendar] Loading calendar events for user:", user.id);
      
      // Ensure migration happens before fetching
      await migrateEventsIfNeeded();
      
      // Fetch custom events from Supabase
      const customEvents = await fetchCalendarEvents();
      console.log("[Calendar] Fetched custom events:", customEvents.length);
      
      // Generate heat events based on dogs data - now showing past events as well
      const heatEvents: CalendarEvent[] = calculateUpcomingHeats(dogs, 6, 24).map((heat, index) => ({
        id: `heat-${heat.dogId}-${index}`,
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
      return [...heatEvents, ...customEvents, ...reminderEvents];
    },
    enabled: !!user && reminders.length >= 0, // Changed to ensure it runs even when there are no reminders yet
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes (reduced from 5)
    retry: 1, // Only retry once to prevent excessive attempts
    refetchOnMount: true,
    refetchOnWindowFocus: true // Enable refetching when window regains focus
  });
  
  // Force a refresh when reminders change
  useEffect(() => {
    if (user && reminders.length > 0) {
      console.log("[Calendar] Force refreshing calendar events after reminders updated");
      refetch();
    }
  }, [user, reminders, refetch]);
  
  // Memoize getEventsForDate to reduce re-renders
  const getEventsForDate = useCallback((date: Date) => {
    const eventsForDate = (calendarEvents || []).filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
    
    if (date.toDateString() === new Date().toDateString()) {
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
  
  // Add event mutation
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
  
  // Edit event mutation
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
  
  // Delete event mutation
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
    queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length, reminders.length] });
    refetch();
  }, [queryClient, user, dogs.length, reminders.length, refetch]);
  
  // Error handling
  const hasError = !!fetchError;
  
  return {
    calendarEvents: calendarEvents || [],
    isLoading,
    hasError: !!fetchError,
    getEventsForDate,
    addEvent: handleAddEvent,
    editEvent: handleEditEvent,
    deleteEvent: handleDeleteEvent,
    getEventColor,
    refreshCalendarData
  };
};
