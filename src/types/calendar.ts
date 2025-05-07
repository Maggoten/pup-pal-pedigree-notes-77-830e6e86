
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  type?: string;
  dogId?: string;
  dogName?: string;
  notes?: string; // Add the missing 'notes' property
}
