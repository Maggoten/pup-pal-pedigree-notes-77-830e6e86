
import { useState, useEffect, useMemo } from 'react';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { useBreedingReminders } from '@/hooks/reminders';
import { reminderToCalendarEvent, remindersToCalendarEvents } from '@/utils/reminderToCalendarMapper';
import { RecentMating, UpcomingHeat } from '@/types/reminders';
import { useAuth } from '@/context/AuthContext';
import { useReminders } from '@/hooks/useReminders';

// Mock data or placeholders as needed
const mockEvents: CalendarEvent[] = [];
const mockRecentMatings: RecentMating[] = [];
const mockUpcomingHeats: UpcomingHeat[] = [];

export function useDashboardData() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockEvents);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  const [plannedLittersData, setPlannedLittersData] = useState({ count: 0, nextDate: null as Date | null });
  const [recentLittersData, setRecentLittersData] = useState({ count: 0, latest: null as Date | null });
  const [recentMatings, setRecentMatings] = useState<RecentMating[]>(mockRecentMatings);
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>(mockUpcomingHeats);
  
  // Get the authentication context
  const { user, isAuthReady } = useAuth();
  
  // Use our standalone reminders hook
  const { 
    reminders,
    isLoading: remindersLoading,
    hasError: remindersError,
    handleMarkComplete
  } = useReminders();
  
  // Track if all data is ready
  const isDataReady = !calendarLoading && !remindersLoading;
  
  // Calculate reminders summary
  const remindersSummary = useMemo(() => {
    return {
      count: reminders.filter(r => !r.isCompleted).length,
      highPriority: reminders.filter(r => r.priority === 'high' && !r.isCompleted).length
    };
  }, [reminders]);
  
  // Convert reminders to calendar events
  useEffect(() => {
    // Skip if reminders are still loading
    if (remindersLoading) return;
    
    // Convert reminders to calendar events
    const reminderEvents = remindersToCalendarEvents(reminders);
    
    // Ensure all date fields are Date objects
    const normalizedReminderEvents = reminderEvents.map(event => ({
      ...event,
      date: event.date instanceof Date ? event.date : new Date(event.date),
      startDate: event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
      endDate: event.endDate instanceof Date ? event.endDate : new Date(event.endDate)
    }));
    
    // Update calendar events with reminder events
    setCalendarEvents(prevEvents => {
      // Filter out any existing reminder events
      const regularEvents = prevEvents.filter(e => !e.isReminderEvent);
      // Ensure all regular events have proper Date objects too
      const normalizedRegularEvents = regularEvents.map(event => ({
        ...event,
        date: event.date instanceof Date ? event.date : new Date(event.date),
        startDate: event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
        endDate: event.endDate instanceof Date ? event.endDate : new Date(event.endDate)
      }));
      
      return [...normalizedRegularEvents, ...normalizedReminderEvents];
    });
    
    setCalendarLoading(false);
  }, [reminders, remindersLoading]);
  
  // Helper methods for calendar
  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    
    return calendarEvents.filter(event => {
      if (!event.date) return false;
      
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  const getEventColor = (type: string) => {
    // Return color based on event type
    switch (type) {
      case 'heat': return 'bg-pink-500';
      case 'breeding': return 'bg-purple-500';
      case 'vet': return 'bg-blue-500';
      case 'show': return 'bg-amber-500';
      case 'pregnancy': return 'bg-rose-500';
      case 'litter': return 'bg-green-500';
      case 'health': return 'bg-cyan-500';
      case 'birthday': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Handlers for calendar events
  const handleAddEvent = (data: AddEventFormValues) => {
    console.log('Adding event:', data);
    // Add event implementation here
    return true;
  };
  
  const handleEditEvent = (eventId: string, data: AddEventFormValues) => {
    console.log('Editing event:', eventId, data);
    // Edit event implementation here
    return true;
  };
  
  const deleteEvent = (eventId: string) => {
    console.log('Deleting event:', eventId);
    // Delete event implementation here
  };
  
  return {
    // Calendar data and methods
    calendarEvents,
    calendarLoading,
    calendarError,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    handleEditEvent,
    deleteEvent,
    
    // Reminders data
    reminders,
    remindersLoading,
    remindersError,
    remindersSummary,
    handleMarkComplete,
    
    // Other dashboard data
    plannedLittersData,
    recentLittersData,
    recentMatings,
    upcomingHeats,
    isDataReady
  };
}
