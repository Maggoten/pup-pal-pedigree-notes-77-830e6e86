
import { useMemo, useEffect, useState } from 'react';
import { subDays } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import useSupabaseCalendarEvents from '@/hooks/useSupabaseCalendarEvents';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { litterService } from '@/services/LitterService';
import { getEventColor } from '@/services/CalendarEventService';

export const useDashboardData = () => {
  // State for data tracking
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [plannedLittersData, setPlannedLittersData] = useState({ count: 0, nextDate: null as Date | null });
  const [recentLittersData, setRecentLittersData] = useState({ count: 0, latest: null as Date | null });
  const [isLoadingPlannedLitters, setIsLoadingPlannedLitters] = useState<boolean>(true);
  const [isLoadingRecentLitters, setIsLoadingRecentLitters] = useState<boolean>(true);
  
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
  
  // Use the Supabase-based calendar hook
  const {
    events,
    isLoading: calendarLoading,
    hasError: calendarError,
    addEvent,
    updateEvent: editEvent,
    deleteEvent,
    getEventsForDay,
    refreshEvents
  } = useSupabaseCalendarEvents();
  
  // Fetch planned litters data
  useEffect(() => {
    const fetchPlannedLittersData = async () => {
      try {
        setIsLoadingPlannedLitters(true);
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
      } catch (error) {
        console.error('Error fetching planned litters:', error);
        setPlannedLittersData({ count: 0, nextDate: null });
      } finally {
        setIsLoadingPlannedLitters(false);
      }
    };
    
    fetchPlannedLittersData();
  }, []);
  
  // Fetch recent litters data
  useEffect(() => {
    const fetchRecentLittersData = async () => {
      try {
        setIsLoadingRecentLitters(true);
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
      } catch (error) {
        console.error('Error fetching recent litters:', error);
        setRecentLittersData({ count: 0, latest: null });
      } finally {
        setIsLoadingRecentLitters(false);
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
  
  // Update data ready state based on actual data loading states
  useEffect(() => {
    const allDataLoaded = 
      !remindersLoading && 
      !calendarLoading && 
      !isLoadingPlannedLitters && 
      !isLoadingRecentLitters;
      
    if (allDataLoaded) {
      setIsDataReady(true);
    } else {
      setIsDataReady(false);
    }
  }, [remindersLoading, calendarLoading, isLoadingPlannedLitters, isLoadingRecentLitters]);
  
  // Create wrapper functions to adapt to what components expect
  const getEventsForDate = (date: Date) => {
    return getEventsForDay(date);
  };

  // Wrapper functions to adapt async functions to the synchronous interface expected by components
  const handleAddEvent = (data: any) => {
    addEvent(data);
    return true; // Always return true synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: any) => {
    editEvent(eventId, data);
    return true; // Always return true synchronously for UI feedback
  };
  
  // Check if there's any data to display
  const hasCalendarData = events && events.length > 0;
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
    hasReminderData,
    refreshEvents
  };
};
