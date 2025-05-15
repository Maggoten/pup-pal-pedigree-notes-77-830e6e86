
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/context/DogsContext';
import { safeFilter } from '@/utils/supabaseTypeUtils';

// Get all calendar events for the current user
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user?.id) {
    console.error('No user ID available');
    return [];
  }
  
  try {
    const { data, error } = await safeFilter(
      supabase.from('calendar_events').select('*'),
      'user_id',
      user.user.id
    ).order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
    
    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      startDate: event.date,
      endDate: event.date,
      type: event.type,
      dogId: event.dog_id,
      dogName: event.dog_name,
      notes: event.notes,
      time: event.time,
    }));
  } catch (err) {
    console.error('Exception fetching calendar events:', err);
    return [];
  }
};

// Add a new calendar event
export const addEventToSupabase = async (event: AddEventFormValues, dogs: Dog[]): Promise<CalendarEvent | null> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user?.id) {
    console.error('No user ID available');
    return null;
  }
  
  const dogName = event.dogId ? dogs.find(d => d.id === event.dogId)?.name || '' : '';
  
  try {
    const eventData = {
      title: event.title,
      date: event.date.toISOString(),
      time: event.time || '',
      type: event.type || 'general',
      dog_id: event.dogId || '',
      dog_name: dogName,
      notes: event.notes || '',
      user_id: user.user.id
    };
    
    const { data, error } = await supabase.from('calendar_events').insert(eventData as any).select().single();
    
    if (error || !data) {
      console.error('Error adding calendar event:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      date: data.date,
      startDate: data.date,
      endDate: data.date,
      type: data.type,
      dogId: data.dog_id,
      dogName: data.dog_name,
      notes: data.notes,
      time: data.time
    };
  } catch (err) {
    console.error('Exception adding calendar event:', err);
    return null;
  }
};

// Update an existing calendar event
export const updateEventInSupabase = async (eventId: string, event: AddEventFormValues, dogs: Dog[]): Promise<CalendarEvent | null> => {
  const dogName = event.dogId ? dogs.find(d => d.id === event.dogId)?.name || '' : '';
  
  try {
    const eventData = {
      title: event.title,
      date: event.date.toISOString(),
      time: event.time || '',
      type: event.type || 'general',
      dog_id: event.dogId || '',
      dog_name: dogName,
      notes: event.notes || '',
    };
    
    const { data, error } = await safeFilter(
      supabase.from('calendar_events').update(eventData as any),
      'id',
      eventId
    ).select().single();
    
    if (error || !data) {
      console.error('Error updating calendar event:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      date: data.date,
      startDate: data.date,
      endDate: data.date,
      type: data.type,
      dogId: data.dog_id,
      dogName: data.dog_name,
      notes: data.notes,
      time: data.time
    };
  } catch (err) {
    console.error('Exception updating calendar event:', err);
    return null;
  }
};

// Delete a calendar event
export const deleteEventFromSupabase = async (eventId: string): Promise<boolean> => {
  try {
    const { error } = await safeFilter(
      supabase.from('calendar_events').delete(),
      'id',
      eventId
    );
    
    if (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception deleting calendar event:', err);
    return false;
  }
};

// Get the color for an event type
export const getEventColor = (eventType: string): string => {
  const colorMap: Record<string, string> = {
    'appointment': 'bg-purple-500',
    'breeding': 'bg-pink-500',
    'heat': 'bg-rose-500',
    'vaccination': 'bg-blue-500',
    'deworming': 'bg-green-500',
    'birthday': 'bg-amber-500',
    'show': 'bg-indigo-500',
    'reminder': 'bg-sky-500',
    'health': 'bg-emerald-500'
  };
  
  return colorMap[eventType] || 'bg-gray-500';
};
