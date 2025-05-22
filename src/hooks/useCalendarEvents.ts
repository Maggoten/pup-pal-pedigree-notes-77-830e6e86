
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { isWithinInterval, add, format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { AddEventFormValues } from '@/components/calendar/types';

const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load events from local storage on component mount
    setIsLoading(true);
    try {
      const storedEvents = localStorage.getItem('calendarEvents');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
      setHasError(false);
    } catch (error) {
      console.error("Error loading calendar events:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever events change
    try {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    } catch (error) {
      console.error("Error saving calendar events:", error);
    }
  }, [events]);

  const addEvent = (eventData: AddEventFormValues) => {
    try {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(), // Generate a unique ID
        title: eventData.title,
        date: eventData.date, // For backward compatibility
        startDate: eventData.date, // New field
        endDate: eventData.date, // New field
        type: 'custom',
        dogId: eventData.dogId,
        notes: eventData.notes || '',
        dogName: eventData.dogId ? 'Dog' : undefined, // We'd need to look up the dog name in a real app
      };

      setEvents([...events, newEvent]);
      toast({
        title: "Event added",
        description: "Your event has been added to the calendar.",
      });
      return true;
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateEvent = (eventId: string, updatedEventData: AddEventFormValues) => {
    try {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            title: updatedEventData.title,
            date: updatedEventData.date, // For backward compatibility
            startDate: updatedEventData.date, // New field
            endDate: updatedEventData.date, // New field
            dogId: updatedEventData.dogId,
            notes: updatedEventData.notes || '',
          };
        }
        return event;
      });

      setEvents(updatedEvents);
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEvent = (eventId: string) => {
    try {
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      toast({
        title: "Event deleted",
        description: "Your event has been deleted from the calendar.",
      });
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter(event => {
      // Use startDate if available, fall back to date for compatibility
      const startDate = new Date(event.startDate || event.date);
      const endDate = new Date(event.endDate || event.date);
      
      return isWithinInterval(day, {
        start: startDate,
        end: add(endDate, { days: 1 }), // Include the entire end day
      });
    });
  };

  // Get color for event type - helper to match expected interface
  const getEventColor = (type: string): string => {
    const colorMap: {[key: string]: string} = {
      'heat': '#ff6b6b',
      'breeding': '#339af0', 
      'veterinary': '#20c997',
      'birthday': '#8c6dff',
      'custom': '#495057'
    };
    return colorMap[type] || '#495057';
  };

  return {
    events,
    isLoading,
    hasError,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay,
    // Aliases for compatibility with expected interface
    getEventsForDate: getEventsForDay,
    getEventColor,
    editEvent: updateEvent,
  };
};

export default useCalendarEvents;
