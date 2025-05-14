
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';

interface CalendarContextType {
  events: CalendarEvent[];
  getEventsForDay: (date: Date) => CalendarEvent[];
  addEvent: (event: AddEventFormValues) => Promise<void>;
  updateEvent: (id: string, event: Partial<AddEventFormValues>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents?: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Add a new event
  const addEvent = async (eventData: AddEventFormValues) => {
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substring(2, 9),
      ...eventData,
      createdAt: new Date(),
    };
    
    setEvents(prev => [...prev, newEvent]);
  };
  
  // Update an existing event
  const updateEvent = async (id: string, eventData: Partial<AddEventFormValues>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, ...eventData } : event
      )
    );
  };
  
  // Delete an event
  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };
  
  // Refresh events from backend
  const refreshEvents = async () => {
    // For now just a placeholder - would be replaced with actual API call
    console.log('Refreshing calendar events...');
  };
  
  const contextValue: CalendarContextType = {
    events,
    getEventsForDay,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
  
  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  
  if (context === undefined) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  
  return context;
};
