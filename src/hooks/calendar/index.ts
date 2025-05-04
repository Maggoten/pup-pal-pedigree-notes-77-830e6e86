
import { useCallback } from 'react';
import { useEventQueries } from './useEventQueries';
import { useEventMutations } from './useEventMutations';
import { useEventFiltering } from './useEventFiltering';
import { Dog } from '@/types/dogs';
import { AddEventFormValues } from '@/components/calendar/types';
import { useAuth } from '@/hooks/useAuth';
import { CalendarHookReturn } from './types';

export const useCalendarEvents = (dogs: Dog[]): CalendarHookReturn => {
  const { user } = useAuth();
  
  // Get event data from query hook
  const { 
    calendarEvents, 
    isLoading, 
    fetchError, 
    refreshCalendarData 
  } = useEventQueries(dogs);
  
  // Get mutations for events
  const {
    addEventMutation,
    editEventMutation,
    deleteEventMutation
  } = useEventMutations(user, dogs);
  
  // Get event filtering functions
  const { 
    getEventsForDate,
    getEventColor 
  } = useEventFiltering(calendarEvents);
  
  // Wrapper functions for mutations
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

// Re-export for backward compatibility
export * from './types';
