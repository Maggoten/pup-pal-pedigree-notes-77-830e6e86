
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startDate: Date;  // Changed from optional to required to match /types/calendar.ts
  endDate: Date;    // Changed from optional to required to match /types/calendar.ts
  time?: string;
  type: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
}

export interface AddEventFormValues {
  title: string;
  date: Date;
  time?: string;
  dogId?: string;
  notes?: string;
}

export interface CalendarGridProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  compact?: boolean;
}
