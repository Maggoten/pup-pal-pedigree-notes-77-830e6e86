
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date format 'YYYY-MM-DD'
  startDate?: string; // ISO date format
  endDate?: string; // ISO date format
  time?: string; // time string e.g., '08:00'
  type: string; // e.g., 'heat', 'birthday', 'vet', etc.
  notes?: string;
  dogId?: string;
  dogName?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarFilter {
  dogs: string[];
  eventTypes: string[];
}

export interface CalendarContextType {
  events: CalendarEvent[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  filters: CalendarFilter;
  setFilters: (filters: CalendarFilter) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'user_id'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  isLoading?: boolean;
}
