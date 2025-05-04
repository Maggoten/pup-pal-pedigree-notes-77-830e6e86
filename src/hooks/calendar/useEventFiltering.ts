
import { useMemo, useCallback } from 'react';
import { isSameDay, isValid } from 'date-fns';
import { CalendarEvent } from '@/components/calendar/types';

export const useEventFiltering = (events: CalendarEvent[] = []) => {
  // Function to get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      console.log(`[Calendar] No events to filter for date ${date.toDateString()}`);
      return [];
    }
    
    console.log(`[Calendar] Filtering ${events.length} events for date: ${date.toDateString()}`);
    
    const eventsForDate = events.filter(event => {
      try {
        // Handle different date formats
        let eventDate: Date | null = null;
        
        if (event.date instanceof Date) {
          eventDate = event.date;
        } else if (typeof event.date === 'string') {
          // Handle ISO string or simple date string
          eventDate = new Date(event.date);
        } else {
          console.warn(`[Calendar] Invalid date format for event: ${event.title}`, event.date);
          return false;
        }
        
        // Validate the date
        if (!isValid(eventDate)) {
          console.warn(`[Calendar] Invalid date for event: ${event.title}`, event.date);
          return false;
        }
        
        // Compare dates using date-fns for accuracy
        const result = isSameDay(eventDate, date);
        return result;
      } catch (error) {
        console.error(`[Calendar] Error comparing dates for event: ${event.title}`, error);
        return false;
      }
    });
    
    // Log all vaccination events for today for debugging
    const vacEvents = eventsForDate.filter(e => e.type === 'vaccination');
    console.log(`[Calendar] Found ${vacEvents.length} vaccination events for ${date.toDateString()}`);
    vacEvents.forEach(e => {
      console.log(`[Calendar] Vaccination event for today: ${e.title}, Dog: ${e.dogName}`);
    });
    
    console.log(`[Calendar] Found ${eventsForDate.length} events for ${date.toDateString()}`);
    return eventsForDate;
  }, [events]);

  // Function to get color for event type
  const getEventColor = useCallback((type: string) => {
    switch (type) {
      case 'heat':
        return 'bg-rose-100 border-rose-300 text-rose-700';
      case 'mating':
        return 'bg-pink-100 border-pink-300 text-pink-700';
      case 'vaccination':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'deworming':
        return 'bg-teal-100 border-teal-300 text-teal-700';
      case 'birthday':
        return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'vet-visit':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'custom':
        return 'bg-indigo-100 border-indigo-300 text-indigo-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  }, []);

  return {
    getEventsForDate,
    getEventColor,
  };
};
