
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { supabase } from '@/integrations/supabase/client';

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

    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      time: event.time,
      type: event.type,
      dogId: event.dog_id,
      dogName: event.dog_name,
      notes: event.notes,
      created_at: new Date(event.created_at),
      updated_at: new Date(event.updated_at)
    }));
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    return [];
  }
};

// Save events to Supabase for the current user
export const saveEvents = async (events: CalendarEvent[]): Promise<void> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found');
      return;
    }
    
    const customEvents = events.filter(event => event.type === 'custom');
    
    // First, delete all existing custom events for the user
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('type', 'custom')
      .eq('user_id', userData.user.id);

    if (deleteError) {
      console.error('Error deleting existing events:', deleteError);
      return;
    }

    // Then insert new custom events
    if (customEvents.length > 0) {
      const eventsToInsert = customEvents.map(event => ({
        title: event.title,
        date: event.date.toISOString(),
        time: event.time,
        type: event.type,
        dog_id: event.dogId,
        dog_name: event.dogName,
        notes: event.notes,
        user_id: userData.user.id
      }));
      
      for (const event of eventsToInsert) {
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(event);

        if (insertError) {
          console.error('Error saving event:', insertError);
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error saving events:', error);
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
  
  const eventData = {
    title: data.title,
    date: combinedDate.toISOString(),
    time: data.time,
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
    
    return {
      id: insertedData.id,
      title: insertedData.title,
      date: new Date(insertedData.date),
      time: insertedData.time,
      type: insertedData.type,
      dogId: insertedData.dog_id,
      dogName: insertedData.dog_name,
      notes: insertedData.notes,
      created_at: new Date(insertedData.created_at),
      updated_at: new Date(insertedData.updated_at)
    };
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
    time: data.time,
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
      event.id === eventId ? {
        id: updatedSupabaseEvent.id,
        title: updatedSupabaseEvent.title,
        date: new Date(updatedSupabaseEvent.date),
        time: updatedSupabaseEvent.time,
        type: updatedSupabaseEvent.type,
        dogId: updatedSupabaseEvent.dog_id,
        dogName: updatedSupabaseEvent.dog_name,
        notes: updatedSupabaseEvent.notes,
        created_at: new Date(updatedSupabaseEvent.created_at),
        updated_at: new Date(updatedSupabaseEvent.updated_at)
      } : event
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

// Get event color based on type
export const getEventColor = (type: string): string => {
  switch (type) {
    case 'heat':
      return 'bg-rose-100 border-rose-300 text-rose-800';
    case 'mating':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'planned-mating':
      return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    case 'due-date':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'custom':
      return 'bg-green-100 border-green-300 text-green-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};
