
import { Dog } from '@/types/dogs';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';

export interface CalendarHookReturn {
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  hasError: boolean;
  getEventsForDate: (date: Date) => CalendarEvent[];
  addEvent: (data: AddEventFormValues) => Promise<boolean>;
  editEvent: (eventId: string, data: AddEventFormValues) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  getEventColor: (type: string) => string;
  refreshCalendarData: () => void;
}

export interface MutationState {
  previousEvents?: CalendarEvent[];
}
