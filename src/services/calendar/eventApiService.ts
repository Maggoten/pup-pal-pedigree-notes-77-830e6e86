
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/context/DogsContext';
import { CalendarEventSupabase, EventDataForSupabase } from './types';

// Helper function to map Supabase data to CalendarEvent type
const mapToCalendarEvent = (event: CalendarEventSupabase): CalendarEvent => ({
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

// Load events from Supabase for the current user
export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found');
      return [];
    }
    
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return data.map(mapToCalendarEvent);
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    return [];
  }
};

// Add a new event to Supabase
export const addEvent = async (data: AddEventFormValues, dogs: Dog[]): Promise<CalendarEvent> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error('No authenticated user found');
  }
  
  // Combine date and time
  const combinedDate = new Date(data.date);
  if (data.time) {
    const [hours, minutes] = data.time.split(':').map(Number);
    combinedDate.setHours(hours, minutes);
  }
  
  let dogName = undefined;
  if (data.dogId) {
    const selectedDog = dogs.find(dog => dog.id === data.dogId);
    if (selectedDog) {
      dogName = selectedDog.name;
    }
  }
  
  const eventData: EventDataForSupabase = {
    title: data.title,
    date: combinedDate.toISOString(),
    time: data.time || null,
    type: 'custom',
    dog_id: data.dogId || null,
    dog_name: dogName || null,
    notes: data.notes || null,
    user_id: userData.user.id
  };
  
  try {
    const { data: insertedData, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Error adding event:', error);
      throw error;
    }

    toast({
      title: "Event Added",
      description: "Your event has been added to the calendar.",
    });
    
    return mapToCalendarEvent(insertedData);
  } catch (error) {
    console.error('Unexpected error adding event:', error);
    throw error;
  }
};

// Edit an existing event in Supabase
export const editEvent = async (
  eventId: string, 
  data: AddEventFormValues, 
  events: CalendarEvent[],
  dogs: Dog[]
): Promise<CalendarEvent[] | null> => {
  const eventToEdit = events.find(event => event.id === eventId);
  
  if (!eventToEdit || eventToEdit.type !== 'custom') {
    return null;
  }
  
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    throw new Error('No authenticated user found');
  }
  
  // Combine date and time
  const combinedDate = new Date(data.date);
  if (data.time) {
    const [hours, minutes] = data.time.split(':').map(Number);
    combinedDate.setHours(hours, minutes);
  }
  
  let dogName = null;
  if (data.dogId) {
    const selectedDog = dogs.find(dog => dog.id === data.dogId);
    if (selectedDog) {
      dogName = selectedDog.name;
    }
  }
  
  const updatedEventData = {
    title: data.title,
    date: combinedDate.toISOString(),
    time: data.time || null,
    notes: data.notes || null,
    dog_id: data.dogId || null,
    dog_name: dogName,
    user_id: userData.user.id
  };
  
  try {
    const { data: updatedSupabaseEvent, error } = await supabase
      .from('calendar_events')
      .update(updatedEventData)
      .eq('id', eventId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating event:', error);
      return null;
    }
    
    toast({
      title: "Event Updated",
      description: "Your event has been updated in the calendar.",
    });
    
    const updatedEvents = events.map(event => 
      event.id === eventId ? mapToCalendarEvent(updatedSupabaseEvent) : event
    );
    
    return updatedEvents;
  } catch (error) {
    console.error('Unexpected error updating event:', error);
    return null;
  }
};

// Delete an event from Supabase
export const deleteEvent = async (eventId: string, events: CalendarEvent[]): Promise<CalendarEvent[] | null> => {
  const eventToDelete = events.find(event => event.id === eventId);
  
  if (!eventToDelete || eventToDelete.type !== 'custom') {
    return null;
  }
  
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      console.error('Error deleting event:', error);
      return null;
    }
    
    toast({
      title: "Event Deleted",
      description: "Your event has been removed from the calendar.",
    });
    
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    return updatedEvents;
  } catch (error) {
    console.error('Unexpected error deleting event:', error);
    return null;
  }
};
