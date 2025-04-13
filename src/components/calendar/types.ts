
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
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
  onDeleteEvent: (eventId: string) => Promise<boolean>;
  onEventClick: (event: CalendarEvent) => void;
  compact?: boolean;
}
