
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { isSupabaseError, safeGet } from '@/utils/supabaseErrorHandler';

/**
 * Service for managing calendar events
 */
class CalendarEventService {
  /**
   * Add a new event to the calendar
   */
  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return data as CalendarEvent;
    } catch (err) {
      console.error('Error adding calendar event:', err);
      return null;
    }
  }
  
  /**
   * Get all events for a user
   */
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId as any)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return data as CalendarEvent[];
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      return [];
    }
  }
  
  /**
   * Delete an event from the calendar
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId as any);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error deleting calendar event:', err);
      return false;
    }
  }
  
  /**
   * Update an existing calendar event
   */
  async updateEvent(event: CalendarEvent): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: event.title,
          date: event.date,
          notes: event.notes,
          type: event.type,
          dog_id: event.dog_id,
          dog_name: event.dog_name,
          time: event.time
        })
        .eq('id', event.id as any)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as CalendarEvent;
    } catch (err) {
      console.error('Error updating calendar event:', err);
      return null;
    }
  }
}

export const calendarEventService = new CalendarEventService();
