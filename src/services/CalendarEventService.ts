
import { CalendarEvent } from '@/components/calendar/types';
import { supabase } from '@/integrations/supabase/client';
import { safeFilter, isSupabaseError } from '@/utils/supabaseTypeUtils';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types/auth';

export const getCalendarEvents = async (userId: string): Promise<CalendarEvent[]> => {
  try {
    // Get all calendar events for the user
    const { data, error } = await safeFilter(
      supabase
        .from('calendar_events')
        .select('*'),
      'user_id',
      userId
    );
    
    if (error) throw error;
    
    // Format the calendar events
    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      time: event.time,
      type: event.type,
      dogId: event.dog_id,
      dogName: event.dog_name,
      notes: event.notes
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>, userId: string): Promise<string | null> => {
  try {
    // Create a new calendar event
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        date: event.date.toISOString(),
        time: event.time,
        type: event.type || 'custom',
        dog_id: event.dogId || null,
        dog_name: event.dogName || null,
        notes: event.notes || null,
        user_id: userId as any,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return null;
  }
};

// Get the color for an event based on its type
export const getEventColor = (eventType: string): string => {
  switch (eventType) {
    case 'heat':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'mating':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'vaccination':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'deworming':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'birthday':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'health':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'breeding':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    case 'reminder':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
