
import { useState, useCallback, useMemo } from 'react';
import { CalendarEvent } from '@/components/calendar/types';
import { Dog } from '@/context/DogsContext';
import { v4 as uuidv4 } from 'uuid';
import { getSampleEvents } from '@/data/sampleCalendarEvents';

export const useCalendarEvents = (dogs: Dog[] = []) => {
  const [events, setEvents] = useState<CalendarEvent[]>(getSampleEvents());
  
  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, [events]);
  
  // Add a new event
  const addEvent = useCallback((newEvent: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const eventWithId: CalendarEvent = {
      ...newEvent,
      id: uuidv4()
    };
    setEvents(prev => [...prev, eventWithId]);
    return eventWithId;
  }, []);
  
  // Delete an event
  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);
  
  // Edit an existing event
  const editEvent = useCallback((updatedEvent: CalendarEvent) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }, []);
  
  // Get color based on event type
  const getEventColor = useCallback((type: string): string => {
    const colorMap: Record<string, string> = {
      'heat': 'bg-red-500',
      'breeding': 'bg-purple-500',
      'whelping': 'bg-blue-500',
      'vaccination': 'bg-green-500',
      'health': 'bg-yellow-500',
      'show': 'bg-indigo-500',
      'other': 'bg-gray-500'
    };
    
    return colorMap[type] || 'bg-gray-500';
  }, []);
  
  return {
    events,
    getEventsForDate,
    addEvent,
    deleteEvent,
    editEvent,
    getEventColor
  };
};
