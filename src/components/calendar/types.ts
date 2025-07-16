
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
  // New Phase 1 fields for advanced heat tracking
  status?: 'predicted' | 'active' | 'ended';
  heatPhase?: 'proestrus' | 'estrus' | 'metestrus' | 'anestrus';
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
