
export interface CalendarEvent {
  id: string;
  title: string;
  date: string | Date;         // Keep for backward compatibility
  startDate: string | Date;    // Primary date field for event start
  endDate: string | Date;      // Primary date field for event end
  type?: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  time?: string;
  description?: string;
}
