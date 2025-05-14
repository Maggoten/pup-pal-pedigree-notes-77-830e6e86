
import { Reminder } from './reminders';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  startDate: Date | string;
  endDate: Date | string;
  type: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  time?: string;
  description?: string;
  isReminderEvent?: boolean;
}

export type EventCategory = 'heat' | 'birthday' | 'vaccination' | 'breeding' | 'litter' | 'pregnancy' | 'health' | 'other';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface AddEventParams {
  title: string;
  date: Date;
  type: EventCategory;
  time?: string;
  notes?: string;
  dogId?: string;
  dogName?: string;
}
