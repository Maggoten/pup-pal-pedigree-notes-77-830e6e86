import { useState, useEffect, useMemo } from 'react';
import { useBreedingReminders } from '@/hooks/reminders';
import useSupabaseCalendarEvents from '@/hooks/useSupabaseCalendarEvents';
import { remindersToCalendarEvents } from '@/utils/reminderToCalendarMapper';
import { AddEventFormValues } from '@/components/calendar/types';
import { isSameDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { CalendarEvent } from '@/types/calendar';
import { usePlannedLitters } from '@/components/planned-litters/hooks';
import { useLitters } from '@/hooks/useLitters';
import { useToast } from '@/components/ui/use-toast';

export const useDashboardData = () => {
  const { toast } = useToast();
  const [isDataReady, setIsDataReady] = useState(false);
  const { user } = useAuth();
  
  // Get reminders data
  const {
    reminders,
    isLoading: remindersLoading,
    hasError: remindersError,
    handleMarkComplete
  } = useBreedingReminders();
  
  // Generate reminder statistics for the dashboard
  const remindersSummary = useMemo(() => {
    const overdue = reminders.filter(r => 
      new Date(r.dueDate) < new Date() && !r.isCompleted
    ).length;
    
    const upcoming = reminders.filter(r => 
      new Date(r.dueDate) >= new Date() && !r.isCompleted
    ).length;
    
    const completed = reminders.filter(r => r.isCompleted).length;
    
    return { total: reminders.length, overdue, upcoming, completed };
  }, [reminders]);
  
  // Get calendar events
  const {
    events,
    isLoading: calendarLoading,
    error: calendarErrorObj,
    hasError: calendarError,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay
  } = useSupabaseCalendarEvents();
  
  // Convert reminders to calendar event format
  const reminderEvents = useMemo(() => {
    console.log(`Converting ${reminders.length} reminders to calendar events`);
    return remindersToCalendarEvents(reminders);
  }, [reminders]);

  // Combine regular events and reminder events
  const combinedEvents = useMemo(() => {
    console.log(`Combining ${events.length} calendar events with ${reminderEvents.length} reminder events`);
    return [...events, ...reminderEvents];
  }, [events, reminderEvents]);
  
  // Get events for a specific date, including reminders
  const getEventsForDate = (date: Date) => {
    return combinedEvents.filter(event => {
      // Use startDate if available, fall back to date for compatibility
      const eventDate = new Date(event.startDate || event.date);
      return isSameDay(eventDate, date);
    });
  };
  
  // Get color for event type
  const getEventColor = (type: string) => {
    if (type.startsWith('reminder-')) {
      const reminderType = type.replace('reminder-', '');
      switch (reminderType) {
        case 'heat':
          return 'bg-rose-500 text-white';
        case 'pregnancy':
          return 'bg-indigo-500 text-white';
        case 'litter':
          return 'bg-amber-500 text-white';
        case 'health':
          return 'bg-emerald-500 text-white';
        case 'vaccination':
          return 'bg-orange-500 text-white';
        case 'birthday':
          return 'bg-blue-500 text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    }
    
    // Existing color logic for regular calendar events
    switch (type) {
      case 'breeding':
        return 'bg-rose-500 text-white';
      case 'whelping':
        return 'bg-indigo-500 text-white';
      case 'vet':
        return 'bg-emerald-500 text-white';
      case 'show':
        return 'bg-amber-500 text-white';
      case 'travel':
        return 'bg-sky-500 text-white';
      case 'training':
        return 'bg-violet-500 text-white';
      case 'heat':
        return 'bg-pink-500 text-white';
      case 'birthday':
      case 'birthday-reminder':
        return 'bg-blue-500 text-white';
      case 'vaccination':
      case 'vaccination-reminder':
        return 'bg-orange-500 text-white';
      case 'custom':
        return 'bg-greige-500 text-white';
      default:
        return 'bg-primary text-white';
    }
  };
  
  // Get planned litters data for the dashboard
  const { plannedLitters: plannedLittersData = [], isLoading: plannedLittersLoading } = usePlannedLitters();
  
  // Get recent litters for the dashboard
  const { recentLitters: recentLittersData = [], isLoading: littersLoading } = useLitters();
  
  // Handle adding events
  const handleAddEvent = async (data: AddEventFormValues) => {
    try {
      return await addEvent(data);
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Handle editing events
  const handleEditEvent = async (eventId: string, data: AddEventFormValues) => {
    try {
      // Only allow editing regular calendar events, not reminder events
      if (eventId.startsWith('reminder-')) {
        toast({
          title: "Cannot Edit",
          description: "Reminder events cannot be directly edited. Please edit the reminder instead."
        });
        return false;
      }
      
      return await updateEvent(eventId, data);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Mark data as ready when all data is loaded
  useEffect(() => {
    const isLoaded = 
      !remindersLoading && 
      !calendarLoading && 
      !plannedLittersLoading &&
      !littersLoading;
    
    if (isLoaded) {
      console.log("Dashboard data ready:", {
        remindersCount: reminders.length,
        eventsCount: events.length,
        combinedEventsCount: combinedEvents.length,
        plannedLitters: plannedLittersData.length,
        recentLitters: recentLittersData.length
      });
      setIsDataReady(true);
    }
  }, [remindersLoading, calendarLoading, plannedLittersLoading, littersLoading]);
  
  return {
    isDataReady,
    reminders,
    remindersSummary,
    remindersLoading,
    remindersError,
    events: combinedEvents,
    calendarLoading,
    calendarError,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    handleEditEvent,
    deleteEvent,
    handleMarkComplete,
    plannedLittersData,
    recentLittersData
  };
};
