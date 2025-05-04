
import { useEffect } from 'react';
import { useDogs } from '@/context/DogsContext';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useLittersData } from './useLittersData';
import { useRemindersSummary } from './useRemindersSummary';
import { useLoadingState } from './useLoadingState';
import { useEventHandlers } from './useEventHandlers';

export const useDashboardData = () => {
  // Get centralized data sources
  const { dogs, loading: dogsLoading } = useDogs();
  
  // Single instances of these hooks to prevent duplicate fetching
  const { 
    reminders, 
    isLoading: remindersLoading, 
    hasError: remindersError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder,
    refreshReminderData
  } = useBreedingReminders();
  
  const {
    getEventsForDate,
    getEventColor,
    addEvent,
    deleteEvent,
    editEvent,
    isLoading: calendarLoading,
    hasError: calendarError,
    calendarEvents,
    refreshCalendarData
  } = useCalendarEvents(dogs);

  // Use the smaller, focused hooks
  const { 
    plannedLittersData, 
    recentLittersData, 
    littersLoaded 
  } = useLittersData();
  
  const remindersSummary = useRemindersSummary(reminders);
  
  const { isDataReady } = useLoadingState({
    dogsLoading,
    remindersLoading,
    calendarLoading,
    littersLoaded
  });

  const { handleAddEvent, handleEditEvent } = useEventHandlers();

  // Log event counts and force refresh if needed
  useEffect(() => {
    console.log("Dashboard data load state:", {
      dogsCount: dogs.length,
      remindersCount: reminders.length,
      eventsCount: calendarEvents?.length || 0,
      dogsLoading,
      remindersLoading,
      calendarLoading
    });
    
    // Force refresh data on first load
    if (dogs.length > 0 && reminders.length === 0 && !remindersLoading) {
      console.log("Forcing refresh of reminders data");
      refreshReminderData();
    }
    
    if (dogs.length > 0 && (!calendarEvents || calendarEvents.length === 0) && !calendarLoading) {
      console.log("Forcing refresh of calendar data");
      refreshCalendarData();
    }
  }, [
    dogs.length, 
    reminders.length, 
    calendarEvents, 
    dogsLoading, 
    remindersLoading, 
    calendarLoading,
    refreshReminderData,
    refreshCalendarData
  ]);
  
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
    handleAddEvent: handleAddEvent(addEvent),
    deleteEvent,
    handleEditEvent: handleEditEvent(editEvent),
    calendarLoading,
    calendarError,
    plannedLittersData,
    recentLittersData,
    remindersSummary,
    hasCalendarData,
    hasReminderData,
    refreshReminderData,
    refreshCalendarData
  };
};
