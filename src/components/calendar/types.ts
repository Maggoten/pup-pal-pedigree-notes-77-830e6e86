
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'heat' | 'mating' | 'due-date' | 'planned-mating' | 'custom';
  dogId?: string;
  dogName?: string;
  notes?: string;
}

export interface AddEventFormValues {
  title: string;
  date: Date;
  time: string;
  type: string;
  dogId?: string;
  notes?: string;
}

// New interface for delete event functionality
export interface DeleteEventParams {
  eventId: string;
}
