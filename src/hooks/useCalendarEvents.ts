
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { add, format, isWithinInterval } from 'date-fns';
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
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
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
          description: updatedEventData.description,
          startDate: updatedEventData.startDate,
          endDate: updatedEventData.endDate,
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
    return events.filter(event =>
      isWithinInterval(day, {
        start: new Date(event.startDate),
        end: add(new Date(event.endDate), { days: 1 }), // Include the entire end day
      })
    );
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
