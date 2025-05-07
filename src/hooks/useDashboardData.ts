
import { useMemo, useEffect, useState } from 'react';
import { subDays } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import useCalendarEvents from '@/hooks/useCalendarEvents';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { litterService } from '@/services/LitterService';

export const useDashboardData = () => {
  // State for controlled loading
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [plannedLittersData, setPlannedLittersData] = useState({ count: 0, nextDate: null as Date | null });
  const [recentLittersData, setRecentLittersData] = useState({ count: 0, latest: null as Date | null });
  
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
  
  // We need to properly destructure what useCalendarEvents actually returns
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay
  } = useCalendarEvents();
  
  // Create our own calendarLoading and calendarError states since they're not provided
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  
  // Set calendar ready after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setCalendarLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch planned litters data
  useEffect(() => {
    const fetchPlannedLittersData = async () => {
      try {
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
      }
    };
    
    fetchPlannedLittersData();
  }, []);
  
  // Fetch recent litters data
  useEffect(() => {
    const fetchRecentLittersData = async () => {
      try {
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
  }, [remindersLoading, calendarLoading, events, reminders]);
  
  // Create wrapper functions to adapt to what components expect
  const getEventsForDate = (date: Date) => {
    return getEventsForDay(date);
  };
  
  // Simple function to get event color based on event type
  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      'heat': 'bg-rose-100 text-rose-800',
      'mating': 'bg-purple-100 text-purple-800',
      'vaccination': 'bg-green-100 text-green-800',
      'birthday': 'bg-blue-100 text-blue-800',
      'vet-visit': 'bg-emerald-100 text-emerald-800',
      'custom': 'bg-amber-100 text-amber-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  
  // Wrapper functions to adapt async functions to the synchronous interface expected by components
  const handleAddEvent = (data: any) => {
    addEvent(data);
    return true; // Always return true synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: any) => {
    updateEvent(eventId, data);
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
    hasReminderData
  };
};

