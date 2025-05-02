
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

export const useCalendarEvents = (dogs: Dog[]) => {
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Handle migration once per session
  const migrateEventsIfNeeded = useCallback(async () => {
    if (!hasMigrated && user) {
      console.log("[Calendar] Starting data migration check...");
      await migrateCalendarEventsFromLocalStorage(dogs);
      setHasMigrated(true);
      console.log("[Calendar] Migration completed");
    }
  }, [hasMigrated, user, dogs]);
  
  // Use React Query for calendar events
  const { 
    data: calendarEvents = [],
    isLoading,
    error: fetchError
  } = useQuery({
    queryKey: ['calendar-events', user?.id, dogs.length],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("[Calendar] Loading calendar events for user:", user.id);
      
      // Ensure migration happens before fetching
      await migrateEventsIfNeeded();
      
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
      
      // Return all events at once
      return [...heatEvents, ...customEvents];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 1, // Only retry once to prevent excessive attempts
    refetchOnMount: true,
    refetchOnWindowFocus: false // Prevent refetching when window regains focus
  });
  
  // Memoize getEventsForDate to reduce re-renders
  const getEventsForDate = useCallback((date: Date) => {
    return (calendarEvents || []).filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
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
  const refreshCalendarData = () => {
    queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
  };
  
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
