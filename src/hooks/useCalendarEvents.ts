
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { isWithinInterval, add, format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { AddEventFormValues } from '@/components/calendar/types';

const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load events from local storage on component mount
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever events change
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: AddEventFormValues) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(), // Generate a unique ID
      title: eventData.title,
      date: format(eventData.date, 'yyyy-MM-dd'), // Format date as string
      startDate: format(eventData.date, 'yyyy-MM-dd'), // New field
      endDate: format(eventData.date, 'yyyy-MM-dd'), // New field
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
  };

  const updateEvent = (eventId: string, updatedEventData: AddEventFormValues) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          title: updatedEventData.title,
          date: format(updatedEventData.date, 'yyyy-MM-dd'),
          startDate: format(updatedEventData.date, 'yyyy-MM-dd'),
          endDate: format(updatedEventData.date, 'yyyy-MM-dd'),
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
  };

  const deleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    toast({
      title: "Event deleted",
      description: "Your event has been deleted from the calendar.",
    });
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

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay,
  };
};

export default useCalendarEvents;
