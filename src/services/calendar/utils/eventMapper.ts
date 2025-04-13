
import { CalendarEvent } from '@/components/calendar/types';
import { CalendarEventSupabase } from '../types';

// Helper function to map Supabase data to CalendarEvent type
export const mapToCalendarEvent = (event: CalendarEventSupabase): CalendarEvent => ({
  id: event.id,
  title: event.title,
  date: new Date(event.date),
  time: event.time || undefined,
  type: event.type,
  dogId: event.dog_id || undefined,
  dogName: event.dog_name || undefined,
  notes: event.notes || undefined,
  created_at: new Date(event.created_at),
  updated_at: new Date(event.updated_at)
});
