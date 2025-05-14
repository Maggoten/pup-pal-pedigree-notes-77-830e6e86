
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  startDate?: Date; // Added for new format compatibility
  endDate?: Date;   // Added for new format compatibility
  isReminderEvent?: boolean; // Flag to identify events that originated from reminders
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
