import { useState, useEffect, useCallback, useMemo } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { useBreedingReminders } from '@/hooks/reminders';
import useCalendarEvents from '@/hooks/useCalendarEvents';
import { remindersToCalendarEvents } from '@/utils/reminderToCalendarMapper';
import { CalendarEvent } from '@/types/calendar';
import { AddEventFormValues } from '@/components/calendar/types';
import { usePlannedLitters as usePlannedLittersHook } from '@/hooks/planned-litters/hooks/usePlannedLitters';
import { useLitterQueries } from '@/hooks/useLitterQueries';
import { useAuth } from '@/hooks/useAuth';
import { parseISODate } from '@/utils/dateUtils';

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
  const calendarEvents = useCalendarEvents();
  // Add isLoading and error properties to match expected interface
  const eventsWithStatus = {
    ...calendarEvents,
    isLoading: false,
    error: null,
    editEvent: calendarEvents.updateEvent // Map updateEvent to editEvent for API compatibility
  };
  
  // Planned litters data
  const plannedLittersHook = usePlannedLittersHook();
  const { 
    plannedLitters,
    isLoading: plannedLittersLoading,
  } = plannedLittersHook;
  
  // Extract or compute nextHeatDate from plannedLitters data
  const nextHeatDate = useMemo(() => {
    if (!plannedLitters || plannedLitters.length === 0) {
      return null;
    }
    
    // Find the next planned heat date
    const sortedLitters = [...plannedLitters].sort(
      (a, b) => new Date(a.expectedHeatDate).getTime() - new Date(b.expectedHeatDate).getTime()
    );
    
    // Ensure we return a Date object, not a string
    const nextDate = sortedLitters[0]?.expectedHeatDate || null;
    return nextDate ? (nextDate instanceof Date ? nextDate : new Date(nextDate)) : null;
  }, [plannedLitters]);
  
  // Get litter data
  const litterQueryResult = useLitterQueries();
  let recentLittersCount = 0;
  let littersThisYear = 0;
  let littersLoading = true;
  
  if (litterQueryResult) {
    // Check if these properties exist before accessing them
    if ('recentLitters' in litterQueryResult && Array.isArray(litterQueryResult.recentLitters)) {
      recentLittersCount = litterQueryResult.recentLitters.length;
    }
    if ('thisYearLitters' in litterQueryResult && Array.isArray(litterQueryResult.thisYearLitters)) {
      littersThisYear = litterQueryResult.thisYearLitters.length;
    }
    if ('isLoading' in litterQueryResult) {
      littersLoading = Boolean(litterQueryResult.isLoading);
    }
  }
  
  const littersError = null; // No error handling for litters currently
  
  // Combine calendar events with reminder events
  const combinedEvents = useMemo(() => {
    const results = [...calendarEvents.events];
    
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
  }, [calendarEvents.events, reminderEvents]);
  
  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return combinedEvents.filter(event => {
      const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
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
  const handleAddEvent = useCallback((data: AddEventFormValues): Promise<boolean> => {
    try {
      calendarEvents.addEvent(data);
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error adding event:", error);
      return Promise.resolve(false);
    }
  }, [calendarEvents.addEvent]);
  
  // Handle edit event mutation wrapper
  const handleEditEvent = useCallback((eventId: string, data: AddEventFormValues): Promise<boolean> => {
    try {
      calendarEvents.updateEvent(eventId, data);
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error editing event:", error);
      return Promise.resolve(false);
    }
  }, [calendarEvents.updateEvent]);
  
  // Format planned litters data for the dashboard
  const plannedLittersData = useMemo(() => {
    return {
      count: plannedLitters.length,
      nextDate: nextHeatDate // This is now guaranteed to be a Date or null
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
    const dataLoaded = !remindersLoading && !plannedLittersLoading && !littersLoading;
    
    if (dataLoaded) {
      setTimeout(() => setIsDataReady(true), 500);
    }
  }, [remindersLoading, plannedLittersLoading, littersLoading]);
  
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
    calendarLoading: eventsWithStatus.isLoading,
    calendarError: !!eventsWithStatus.error,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    deleteEvent: calendarEvents.deleteEvent,
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
