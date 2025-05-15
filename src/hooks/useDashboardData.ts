
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CalendarEvent } from '@/components/calendar/types';
import { Reminder } from '@/types/reminders';
import { getCalendarEvents, getEventColor } from '@/services/CalendarEventService';
import { toast } from '@/components/ui/use-toast';
import { isSameDay } from 'date-fns';

export const useDashboardData = () => {
  const { user } = useAuth();
  
  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  
  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersSummary, setRemindersSummary] = useState<{ count: number } | null>(null);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [remindersError, setRemindersError] = useState(false);
  
  // Planned Litters State
  const [plannedLittersData, setPlannedLittersData] = useState<{ count: number } | null>(null);
  const [plannedLittersLoading, setPlannedLittersLoading] = useState(true);
  
  // Recent Litters State
  const [recentLittersData, setRecentLittersData] = useState<{ count: number } | null>(null);
  const [recentLittersLoading, setRecentLittersLoading] = useState(true);
  
  // Load calendar events
  useEffect(() => {
    const loadEvents = async () => {
      if (user?.id) {
        try {
          setCalendarLoading(true);
          const data = await getCalendarEvents(user.id);
          setEvents(data);
          setCalendarError(false);
        } catch (error) {
          console.error('Error loading calendar events:', error);
          setCalendarError(true);
          toast({
            title: "Error",
            description: "Failed to load calendar events",
            variant: "destructive",
          });
        } finally {
          setCalendarLoading(false);
        }
      }
    };
    
    loadEvents();
  }, [user?.id]);

  // Sample data for planned litters & recent litters
  useEffect(() => {
    // Mock data loading for planned litters
    setPlannedLittersData({ count: 3 });
    setPlannedLittersLoading(false);
    
    // Mock data loading for recent litters
    setRecentLittersData({ count: 2 });
    setRecentLittersLoading(false);
    
    // Mock reminders data
    setReminders([
      {
        id: '1',
        title: 'Schedule vet appointment',
        description: 'Annual checkup for Max',
        type: 'health',
        priority: 'high',
        due_date: new Date(),
        is_completed: false,
      },
      {
        id: '2',
        title: 'Vaccination reminder',
        description: 'Luna needs her shots',
        type: 'vaccination',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000),
        is_completed: false,
      }
    ]);
    setRemindersSummary({ count: 2 });
    setRemindersLoading(false);
  }, []);
  
  // Function to get events for a specific date
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.date, date));
  }, [events]);
  
  // Handler for adding a new event
  const handleAddEvent = useCallback(async (event: Partial<CalendarEvent>) => {
    if (!user?.id) return;
    
    try {
      // Implement proper event adding logic here
      toast({
        title: "Event Added",
        description: "Your event has been successfully added to the calendar.",
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  }, [user?.id]);
  
  // Handler for deleting an event
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      // Implement proper event deletion logic here
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  }, []);
  
  // Handler for editing an event
  const handleEditEvent = useCallback(async (eventId: string, updatedEvent: Partial<CalendarEvent>) => {
    try {
      // Implement proper event editing logic here
      setEvents(prev => prev.map(event => event.id === eventId ? { ...event, ...updatedEvent } : event));
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  }, []);
  
  // Handler for marking reminders as complete
  const handleMarkComplete = useCallback(async (reminderId: string) => {
    try {
      // Implement proper reminder completion logic here
      setReminders(prev => prev.map(reminder => reminder.id === reminderId 
        ? { ...reminder, is_completed: true } : reminder));
      toast({
        title: "Reminder Completed",
        description: "The reminder has been marked as complete.",
      });
    } catch (error) {
      console.error('Error marking reminder as complete:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder status",
        variant: "destructive",
      });
    }
  }, []);
  
  const isDataReady = !calendarLoading && !remindersLoading && !plannedLittersLoading && !recentLittersLoading;
  
  return {
    events,
    reminders,
    remindersSummary,
    plannedLittersData,
    recentLittersData,
    calendarLoading,
    calendarError,
    remindersLoading,
    remindersError,
    isDataReady,
    getEventsForDate,
    getEventColor,
    handleAddEvent,
    deleteEvent,
    handleEditEvent,
    handleMarkComplete
  };
};
