
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

  // Log event counts
  useEffect(() => {
    console.log("Dashboard data load state:", {
      dogsCount: dogs.length,
      remindersCount: reminders.length,
      eventsCount: calendarEvents?.length || 0
    });
  }, [dogs.length, reminders.length, calendarEvents]);
  
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
    hasReminderData
  };
};
