
import { supabase } from '@/integrations/supabase/client';
import { AddEventFormValues, CalendarEvent } from '@/components/calendar/types';
import { Dog } from '@/types/dogs';
import { formatISO } from 'date-fns';
import { safeFilter } from '@/utils/supabaseTypeUtils';

// Get all calendar events for the current user
export const getCalendarEvents = async (userId?: string): Promise<CalendarEvent[]> => {
  try {
    let query = supabase.from('calendar_events').select('*');
    
    // If userId is provided, filter by that userId
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Convert to our CalendarEvent type
    return (data || []).map((event) => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      startDate: event.date ? new Date(event.date) : undefined,
      endDate: event.date ? new Date(event.date) : undefined,
      time: event.time || '',
      type: event.type || 'general',
      dogId: event.dog_id || '',
      dogName: event.dog_name || '',
      notes: event.notes || ''
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

// Add a new calendar event and return the created event
export const addEventToSupabase = async (
  eventData: AddEventFormValues, 
  dogs: Dog[]
): Promise<CalendarEvent | null> => {
  try {
    const { date, time, notes, dogId, title } = eventData;
    const eventType = eventData.eventType || 'general';
    
    // Find dog info if a dog is selected
    let dogName = '';
    if (dogId) {
      const selectedDog = dogs.find(dog => dog.id === dogId);
      dogName = selectedDog ? selectedDog.name : '';
    }
    
    // Current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Insert event into Supabase
    const { data, error } = await supabase.from('calendar_events').insert({
      title,
      date: formatISO(date),
      time,
      type: eventType,
      dog_id: dogId || null,
      dog_name: dogName || null,
      notes: notes || null,
      user_id: user.id
    }).select().single();
    
    if (error) throw error;
    
    // Return the created event in our CalendarEvent format
    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date),
      startDate: data.date ? new Date(data.date) : undefined,
      endDate: data.date ? new Date(data.date) : undefined,
      time: data.time || '',
      type: data.type || 'general',
      dogId: data.dog_id || '',
      dogName: data.dog_name || '',
      notes: data.notes || ''
    };
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return null;
  }
};

// Update an existing calendar event
export const updateEventInSupabase = async (
  eventId: string,
  eventData: AddEventFormValues,
  dogs: Dog[]
): Promise<CalendarEvent | null> => {
  try {
    const { date, time, notes, dogId, title } = eventData;
    const eventType = eventData.eventType || 'general';
    
    // Find dog info if a dog is selected
    let dogName = '';
    if (dogId) {
      const selectedDog = dogs.find(dog => dog.id === dogId);
      dogName = selectedDog ? selectedDog.name : '';
    }
    
    // Update event in Supabase
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title,
        date: formatISO(date),
        time,
        type: eventType,
        dog_id: dogId || null,
        dog_name: dogName || null,
        notes: notes || null
      })
      .eq('id', eventId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Return the updated event in our CalendarEvent format
    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date),
      startDate: data.date ? new Date(data.date) : undefined,
      endDate: data.date ? new Date(data.date) : undefined,
      time: data.time || '',
      type: data.type || 'general',
      dogId: data.dog_id || '',
      dogName: data.dog_name || '',
      notes: data.notes || ''
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return null;
  }
};

// Delete a calendar event
export const deleteEventFromSupabase = async (eventId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
};

// Get event color based on event type
export const getEventColor = (eventType: string): string => {
  switch (eventType) {
    case 'heat':
      return 'bg-red-500';
    case 'vaccination':
      return 'bg-green-500';
    case 'vet':
      return 'bg-blue-500';
    case 'mating':
      return 'bg-pink-500';
    case 'birth':
      return 'bg-purple-500';
    case 'grooming':
      return 'bg-yellow-500';
    case 'training':
      return 'bg-orange-500';
    case 'show':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-500';
  }
};
