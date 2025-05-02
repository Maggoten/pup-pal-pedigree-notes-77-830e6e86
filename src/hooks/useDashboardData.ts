
import { useMemo, useEffect, useState } from 'react';
import { addDays, subDays } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

export const useDashboardData = () => {
  // State for controlled loading
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  
  // Centralized data fetching for calendar and reminders
  const { dogs } = useDogs();
  
  // Single instances of these hooks to prevent duplicate fetching
  const { 
    reminders, 
    isLoading: remindersLoading, 
    hasError: remindersError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  } = useBreedingReminders();
  
  const {
    getEventsForDate,
    getEventColor,
    addEvent,
    deleteEvent,
    editEvent,
    isLoading: calendarLoading,
    hasError: calendarError,
    calendarEvents
  } = useCalendarEvents(dogs);
  
  // Sample data for planned litters and recent litters
  // In a real implementation, this would come from actual data services
  const plannedLittersData = useMemo(() => {
    return {
      count: 2,
      nextDate: addDays(new Date(), 14) // Example: next planned litter in 14 days
    };
  }, []);
  
  const recentLittersData = useMemo(() => {
    return {
      count: 3,
      latest: subDays(new Date(), 21) // Example: most recent litter was 21 days ago
    };
  }, []);
  
  const remindersSummary = useMemo(() => {
    const highPriorityCount = reminders.filter(r => r.priority === 'high' && !r.isCompleted).length;
    return {
      count: reminders.filter(r => !r.isCompleted).length,
      highPriority: highPriorityCount
    };
  }, [reminders]);
  
  // Controlled data loading with transition delay
  useEffect(() => {
    if (!remindersLoading && !calendarLoading) {
      // Set a moderate delay for stable transition
      const timer = setTimeout(() => {
        setIsDataReady(true);
      }, 300);
      
      // Clear timeout on cleanup
      return () => clearTimeout(timer);
    } else {
      // Reset the state if either data source is loading
      setIsDataReady(false);
    }
  }, [remindersLoading, calendarLoading, calendarEvents, reminders]);
  
  // Wrapper functions to adapt async functions to the synchronous interface expected by components
  const handleAddEvent = (data: any) => {
    const result = addEvent(data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch(err => {
        console.error("Error adding event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: any) => {
    const result = editEvent(eventId, data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch(err => {
        console.error("Error editing event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  // Check if there's any data to display
  const hasCalendarData = calendarEvents && calendarEvents.length > 0;
  const hasReminderData = reminders && reminders.length > 0;
  
  return {
    isDataReady,
    dogs,
    reminders,
    remindersLoading,
    remindersError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    deleteEvent,
    handleEditEvent,
    calendarLoading,
    calendarError,
    plannedLittersData,
    recentLittersData,
    remindersSummary,
    hasCalendarData,
    hasReminderData
  };
};
