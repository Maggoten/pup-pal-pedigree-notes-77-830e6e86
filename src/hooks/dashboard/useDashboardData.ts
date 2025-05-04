
import { useEffect, useCallback } from 'react';
import { useDogs } from '@/context/DogsContext';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useLittersData } from './useLittersData';
import { useRemindersSummary } from './useRemindersSummary';
import { useLoadingState } from './useLoadingState';
import { useEventHandlers } from './useEventHandlers';

export const useDashboardData = () => {
  // Get centralized data sources
  const { dogs, loading: dogsLoading, refreshDogs: refreshDogData } = useDogs();
  
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
  
  // Enhanced refresh function that makes sure dogs are loaded first
  const refreshAllData = useCallback(async () => {
    console.log('[DASHBOARD] Refreshing all data...');
    // First refresh dogs
    await refreshDogData(true);
    // Then refresh reminders and calendar (which depend on dogs)
    await Promise.all([
      refreshReminderData(),
      refreshCalendarData()
    ]);
    console.log('[DASHBOARD] All data refreshed');
  }, [refreshDogData, refreshReminderData, refreshCalendarData]);

  // Log event counts and force refresh if needed
  useEffect(() => {
    console.log("[DASHBOARD] Data load state:", {
      dogsCount: dogs.length,
      remindersCount: reminders?.length || 0,
      eventsCount: calendarEvents?.length || 0,
      dogsLoading,
      remindersLoading,
      calendarLoading
    });
    
    // Force refresh data on first load if dogs are available
    if (dogs.length > 0) {
      if ((!reminders || reminders.length === 0) && !remindersLoading) {
        console.log("[DASHBOARD] Forcing refresh of reminders data - missing reminders");
        refreshReminderData();
      }
      
      if ((!calendarEvents || calendarEvents.length === 0) && !calendarLoading) {
        console.log("[DASHBOARD] Forcing refresh of calendar data - missing events");
        refreshCalendarData();
      }
    } else if (!dogsLoading) {
      // No dogs and not loading dogs - try to refresh dogs data
      console.log("[DASHBOARD] No dogs available, forcing refresh of dogs data");
      refreshDogData(true);
    }
  }, [
    dogs.length, 
    reminders, 
    calendarEvents, 
    dogsLoading, 
    remindersLoading, 
    calendarLoading,
    refreshReminderData,
    refreshCalendarData,
    refreshDogData
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
    refreshCalendarData,
    refreshDogData,
    refreshAllData
  };
};
