
import { useState, useEffect, useCallback, useMemo } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import useCalendarEvents from '@/hooks/useCalendarEvents';
import { remindersToCalendarEvents } from '@/utils/reminderToCalendarMapper';
import { CalendarEvent } from '@/types/calendar';
import { AddEventFormValues } from '@/components/calendar/types';
import { usePlannedLitters } from '@/hooks/planned-litters/hooks/usePlannedLitters';
import { useLitterQueries } from '@/hooks/useLitterQueries';
import { useAuth } from '@/hooks/useAuth';

// Interface for litter queries result with proper properties
interface LitterQueryData {
  recentLittersCount: number;
  littersThisYear: number;
  isLoading: boolean;
  error: any;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [isDataReady, setIsDataReady] = useState(false);
  
  // Get reminders data
  const { 
    reminders, 
    isLoading: remindersLoading, 
    hasError: remindersError,
    handleMarkComplete,
    remindersSummary
  } = useBreedingReminders();
  
  // Convert reminders to calendar events format
  const reminderEvents = useMemo(() => {
    return remindersToCalendarEvents(reminders);
  }, [reminders]);
  
  // Get calendar events data
  const { 
    events: calendarEvents, 
    isLoading: eventsLoading, 
    error: calendarError,
    addEvent,
    deleteEvent,
    editEvent 
  } = useCalendarEvents();
  
  // Planned litters data
  const { 
    plannedLitters,
    isLoading: plannedLittersLoading,
    nextHeatDate
  } = usePlannedLitters();
  
  // Recent litters data - cast the result to include the needed properties
  const litterQueryData = useLitterQueries() as unknown as LitterQueryData;
  const { 
    recentLittersCount,
    littersThisYear,
    isLoading: littersLoading,
    error: littersError
  } = litterQueryData;
  
  // Combine calendar events with reminder events
  const combinedEvents = useMemo(() => {
    const results = [...calendarEvents];
    
    // Only add reminder events that don't overlap with existing calendar events
    if (reminderEvents && reminderEvents.length > 0) {
      for (const reminderEvent of reminderEvents) {
        // Check if this reminder is already in the calendar events
        const exists = results.some(calEvent => 
          calEvent.id === reminderEvent.id || 
          (calEvent.title === reminderEvent.title && 
          isSameDay(new Date(calEvent.date), new Date(reminderEvent.date)))
        );
        
        if (!exists) {
          results.push(reminderEvent);
        }
      }
    }
    
    return results;
  }, [calendarEvents, reminderEvents]);
  
  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return combinedEvents.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : parseISO(event.date as string);
      return isSameDay(eventDate, date);
    });
  }, [combinedEvents]);
  
  // Get color for event type
  const getEventColor = useCallback((type: string) => {
    switch (type) {
      case 'heat':
        return 'bg-pink-500';
      case 'birthday':
        return 'bg-blue-500';
      case 'vaccination':
        return 'bg-green-500';
      case 'breeding':
        return 'bg-purple-500';
      case 'litter':
        return 'bg-amber-500';
      case 'pregnancy':
        return 'bg-rose-500';
      case 'health':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  }, []);
  
  // Handle add event mutation wrapper
  const handleAddEvent = useCallback((data: AddEventFormValues) => {
    return addEvent(data);
  }, [addEvent]);
  
  // Handle edit event mutation wrapper
  const handleEditEvent = useCallback((eventId: string, data: AddEventFormValues) => {
    return editEvent(eventId, data);
  }, [editEvent]);
  
  // Format planned litters data for the dashboard
  const plannedLittersData = useMemo(() => {
    return {
      count: plannedLitters.length,
      nextDate: nextHeatDate
    };
  }, [plannedLitters, nextHeatDate]);
  
  // Format recent litters data for the dashboard
  const recentLittersData = useMemo(() => {
    return {
      count: recentLittersCount,
      recent: littersThisYear
    };
  }, [recentLittersCount, littersThisYear]);
  
  // Determine when data is ready
  useEffect(() => {
    const dataLoaded = !remindersLoading && !eventsLoading && !plannedLittersLoading && !littersLoading;
    
    if (dataLoaded) {
      setTimeout(() => setIsDataReady(true), 500);
    }
  }, [remindersLoading, eventsLoading, plannedLittersLoading, littersLoading]);
  
  return {
    // Data status
    isDataReady,
    
    // Reminders data and actions
    reminders,
    remindersLoading,
    remindersError,
    handleMarkComplete,
    remindersSummary,
    
    // Calendar events data and actions  
    events: combinedEvents,
    calendarLoading: eventsLoading,
    calendarError: !!calendarError,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    deleteEvent,
    handleEditEvent,
    
    // Planned litters data
    plannedLittersData,
    plannedLittersLoading,
    
    // Recent litters data
    recentLittersData,
    littersLoading,
    littersError
  };
};
