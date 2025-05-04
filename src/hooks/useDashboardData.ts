
import { useMemo, useEffect, useState } from 'react';
import { subDays } from 'date-fns';
import { useDogs } from '@/context/DogsContext'; // Updated import path
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { litterService } from '@/services/LitterService';

export const useDashboardData = () => {
  // State for controlled loading
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [plannedLittersData, setPlannedLittersData] = useState({ count: 0, nextDate: null as Date | null });
  const [recentLittersData, setRecentLittersData] = useState({ count: 0, latest: null as Date | null });
  const [littersLoaded, setLittersLoaded] = useState<boolean>(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState<boolean>(false);
  
  // Centralized data fetching for calendar and reminders
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
  
  // Fetch planned litters data
  useEffect(() => {
    const fetchPlannedLittersData = async () => {
      try {
        console.log("Fetching planned litters data...");
        const plannedLitters = await plannedLittersService.loadPlannedLitters();
        
        // Sort planned litters by expected heat date to find the next one
        const sortedLitters = [...plannedLitters].sort(
          (a, b) => new Date(a.expectedHeatDate).getTime() - new Date(b.expectedHeatDate).getTime()
        );
        
        // Find the next planned litter (with heat date in the future)
        const nextLitter = sortedLitters.find(
          litter => new Date(litter.expectedHeatDate).getTime() > Date.now()
        );
        
        setPlannedLittersData({
          count: plannedLitters.length,
          nextDate: nextLitter ? new Date(nextLitter.expectedHeatDate) : null
        });
        
        console.log("Planned litters data loaded:", plannedLitters.length);
      } catch (error) {
        console.error('Error fetching planned litters:', error);
        setPlannedLittersData({ count: 0, nextDate: null });
      }
    };
    
    fetchPlannedLittersData();
  }, []);
  
  // Fetch recent litters data
  useEffect(() => {
    const fetchRecentLittersData = async () => {
      try {
        console.log("Fetching recent litters data...");
        // Get all litters
        const activeLitters = await litterService.getActiveLitters();
        const archivedLitters = await litterService.getArchivedLitters();
        const allLitters = [...activeLitters, ...archivedLitters];
        
        // Consider litters from the last 90 days as "recent"
        const ninetyDaysAgo = subDays(new Date(), 90);
        const recentLitters = allLitters.filter(
          litter => new Date(litter.dateOfBirth) >= ninetyDaysAgo
        );
        
        // Find the most recent litter
        let latestDate: Date | null = null;
        if (recentLitters.length > 0) {
          const sortedLitters = [...recentLitters].sort(
            (a, b) => new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime()
          );
          latestDate = sortedLitters[0] ? new Date(sortedLitters[0].dateOfBirth) : null;
        }
        
        setRecentLittersData({
          count: recentLitters.length,
          latest: latestDate
        });
        
        console.log("Recent litters data loaded:", recentLitters.length);
        setLittersLoaded(true);
      } catch (error) {
        console.error('Error fetching recent litters:', error);
        setRecentLittersData({ count: 0, latest: null });
        // Even with an error, we still consider litters loaded to avoid blocking the UI
        setLittersLoaded(true);
      }
    };
    
    fetchRecentLittersData();
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
    if (!initialLoadAttempted) {
      // Mark that we have attempted loading initially
      setInitialLoadAttempted(true);
      console.log("Initial load attempted");
    }
    
    // Set data as ready when:
    // 1. Reminders are no longer loading AND calendar is no longer loading
    // 2. OR we've attempted to load at least once and litters are loaded (handles case when user has no dogs)
    const dataIsReady = (!remindersLoading && !calendarLoading) || 
                        (initialLoadAttempted && littersLoaded && !dogsLoading);
                        
    if (dataIsReady && !isDataReady) {
      console.log("Data is ready, transitioning to ready state");
      // Set a moderate delay for stable transition
      const timer = setTimeout(() => {
        setIsDataReady(true);
        console.log("Dashboard data is now ready");
      }, 300);
      
      // Clear timeout on cleanup
      return () => clearTimeout(timer);
    }
  }, [remindersLoading, calendarLoading, littersLoaded, initialLoadAttempted, isDataReady, dogsLoading]);
  
  // Log data load state
  useEffect(() => {
    console.log("Dashboard data load state:", {
      dogsLoading,
      remindersLoading,
      calendarLoading,
      littersLoaded,
      initialLoadAttempted,
      isDataReady,
      dogsCount: dogs.length,
      remindersCount: reminders.length,
      eventsCount: calendarEvents?.length || 0
    });
  }, [dogsLoading, remindersLoading, calendarLoading, littersLoaded, initialLoadAttempted, isDataReady, dogs.length, reminders.length, calendarEvents]);
  
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
