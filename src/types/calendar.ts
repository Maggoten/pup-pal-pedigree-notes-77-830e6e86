
export interface CalendarEvent {
  id: string;
  title: string;
  date: string | Date;
  startDate?: string | Date; // Added for compatibility with both systems
  endDate?: string | Date;   // Added for compatibility with both systems
  type?: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  time?: string;
  description?: string;
}
