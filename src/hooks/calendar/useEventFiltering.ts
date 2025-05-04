
import { useCallback } from 'react';
import { CalendarEvent } from '@/components/calendar/types';
import { isValid } from 'date-fns';
import { getNormalizedToday } from '@/utils/dateUtils';
import { getEventColor } from '@/services/CalendarEventService';

export const useEventFiltering = (calendarEvents: CalendarEvent[] = []) => {
  // Memoize getEventsForDate to reduce re-renders
  const getEventsForDate = useCallback((date: Date) => {
    if (!calendarEvents || !Array.isArray(calendarEvents)) {
      console.log("[Calendar] No calendar events available");
      return [];
    }
    
    // Normalize comparison dates to avoid time issues
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    const eventsForDate = calendarEvents.filter(event => {
      if (!event || !event.date) return false;
      
      // Convert event.date to string for comparison if it's a Date object
      let eventDateStr: string;
      
      try {
        if (event.date instanceof Date) {
          eventDateStr = event.date.toISOString().split('T')[0];
        } else if (typeof event.date === 'string') {
          // Handle ISO string directly with proper type assertion
          eventDateStr = (event.date as string).split('T')[0];
        } else {
          // Handle date that's not a Date or string - create a new Date object
          const eventDate = new Date(event.date as any);
          if (isValid(eventDate)) {
            eventDateStr = eventDate.toISOString().split('T')[0];
          } else {
            // If we can't create a valid date, log the issue and skip this event
            console.error(`[Calendar] Invalid date format:`, event.date);
            return false;
          }
        }
        
        return eventDateStr === targetDateStr;
      } catch (err) {
        console.error(`[Calendar] Error processing event date:`, event.date, err);
        return false;
      }
    });
    
    const today = getNormalizedToday();
    if (date.toDateString() === today.toDateString()) {
      console.log("[Calendar] Events for today:", eventsForDate);
      
      // Specifically log vaccination events for today
      const vacEvents = eventsForDate.filter(e => e.type === 'vaccination');
      if (vacEvents.length > 0) {
        console.log("[Calendar] Vaccination events for today:", 
          vacEvents.map(e => `${e.title} (Dog: ${e.dogName})`));
      } else {
        console.log("[Calendar] No vaccination events for today");
      }
    }
    
    return eventsForDate;
  }, [calendarEvents]);
  
  return {
    getEventsForDate,
    getEventColor
  };
};
