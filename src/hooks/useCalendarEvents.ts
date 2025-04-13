
import { useState, useEffect } from 'react';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { getSampleEvents } from '@/data/sampleCalendarEvents';
import { 
  loadEvents, 
  saveEvents, 
  addEvent, 
  editEvent, 
  deleteEvent,
  getEventColor 
} from '@/services/CalendarEventService';

export const useCalendarEvents = (dogs: Dog[]) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Load events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      // Load custom events from Supabase
      const customEvents = await loadEvents();
      
      // Get sample events
      const sampleEvents = getSampleEvents();
      
      // Calculate heat events based on dogs data
      const upcomingHeats = calculateUpcomingHeats(dogs);
      const heatEvents: CalendarEvent[] = upcomingHeats.map((heat, index) => ({
        id: `heat-${heat.dogId}-${index}`,
        title: 'Heat Cycle',
        date: heat.date,
        type: 'heat',
        dogId: heat.dogId,
        dogName: heat.dogName
      }));
      
      // Combine all events
      setCalendarEvents([...sampleEvents, ...heatEvents, ...customEvents]);
    };
    
    fetchEvents();
  }, [dogs]);
  
  // Save custom events to Supabase whenever they change
  useEffect(() => {
    saveEvents(calendarEvents);
  }, [calendarEvents]);
  
  // Function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };
  
  // Function to add a new event
  const handleAddEvent = async (data: AddEventFormValues) => {
    const newEvent = await addEvent(data, dogs);
    setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
    return true;
  };
  
  // Function to edit an event
  const handleEditEvent = async (eventId: string, data: AddEventFormValues) => {
    const updatedEvents = await editEvent(eventId, data, calendarEvents, dogs);
    
    if (updatedEvents) {
      setCalendarEvents(updatedEvents);
      return true;
    }
    
    return false;
  };
  
  // Function to delete an event
  const handleDeleteEvent = async (eventId: string) => {
    const updatedEvents = await deleteEvent(eventId, calendarEvents);
    
    if (updatedEvents) {
      setCalendarEvents(updatedEvents);
      return true;
    }
    
    return false;
  };
  
  return {
    calendarEvents,
    getEventsForDate,
    addEvent: handleAddEvent,
    editEvent: handleEditEvent,
    deleteEvent: handleDeleteEvent,
    getEventColor
  };
};
