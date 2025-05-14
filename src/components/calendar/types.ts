
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  startDate: Date; // Changed from optional to required
  endDate: Date;   // Changed from optional to required
  isReminderEvent?: boolean; // Flag to identify events that originated from reminders
}

export interface AddEventFormValues {
  title: string;
  date: Date;
  time?: string;  // Added this field
  dogId?: string;
  notes?: string;
  type?: string;  // Added this field
  dogName?: string;  // Added this field
}

export interface CalendarGridProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  compact?: boolean;
}
