
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { supabase } from '@/integrations/supabase/client';

// Load events from Supabase for the current user
export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return data.map(event => ({
      ...event,
      date: new Date(event.date),
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
  const customEvents = events.filter(event => event.type === 'custom');
  
  try {
    // First, delete all existing custom events for the user
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('type', 'custom');

    if (deleteError) {
      console.error('Error deleting existing events:', deleteError);
      return;
    }

    // Then insert new custom events
    if (customEvents.length > 0) {
      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(customEvents.map(event => ({
          title: event.title,
          date: event.date.toISOString(),
          time: event.time,
          type: event.type,
          dog_id: event.dogId,
          dog_name: event.dogName,
          notes: event.notes
        })));

      if (insertError) {
        console.error('Error saving events:', insertError);
      }
    }
  } catch (error) {
    console.error('Unexpected error saving events:', error);
  }
};

// Add a new event to Supabase
export const addEvent = async (data: AddEventFormValues, dogs: Dog[]): Promise<CalendarEvent> => {
  // Combine date and time
  const combinedDate = new Date(data.date);
  if (data.time) {
    const [hours, minutes] = data.time.split(':').map(Number);
    combinedDate.setHours(hours, minutes);
  }
  
  const newEvent: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
    title: data.title,
    date: combinedDate,
    time: data.time,
    type: 'custom',
    notes: data.notes
  };
  
  if (data.dogId) {
    const selectedDog = dogs.find(dog => dog.id === data.dogId);
    if (selectedDog) {
      newEvent.dogId = data.dogId;
      newEvent.dogName = selectedDog.name;
    }
  }
  
  try {
    const { data: insertedData, error } = await supabase
      .from('calendar_events')
      .insert({
        title: newEvent.title,
        date: newEvent.date.toISOString(),
        time: newEvent.time,
        type: newEvent.type,
        dog_id: newEvent.dogId,
        dog_name: newEvent.dogName,
        notes: newEvent.notes
      })
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
      ...newEvent,
      date: new Date(insertedData.date),
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
  
  if (eventToEdit && eventToEdit.type === 'custom') {
    // Combine date and time
    const combinedDate = new Date(data.date);
    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);
      combinedDate.setHours(hours, minutes);
    }
    
    const updatedEventData = {
      title: data.title,
      date: combinedDate.toISOString(),
      time: data.time,
      notes: data.notes,
      dog_id: data.dogId ? data.dogId : null,
      dog_name: null
    };

    // Update dog information if changed
    if (data.dogId) {
      const selectedDog = dogs.find(dog => dog.id === data.dogId);
      if (selectedDog) {
        updatedEventData.dog_name = selectedDog.name;
      }
    }
    
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
          ...event,
          title: updatedSupabaseEvent.title,
          date: new Date(updatedSupabaseEvent.date),
          time: updatedSupabaseEvent.time,
          notes: updatedSupabaseEvent.notes,
          dogId: updatedSupabaseEvent.dog_id,
          dogName: updatedSupabaseEvent.dog_name
        } : event
      );
      
      return updatedEvents;
    } catch (error) {
      console.error('Unexpected error updating event:', error);
      return null;
    }
  }
  
  return null;
};

// Delete an event from Supabase
export const deleteEvent = async (eventId: string, events: CalendarEvent[]): Promise<CalendarEvent[] | null> => {
  const eventToDelete = events.find(event => event.id === eventId);
  
  if (eventToDelete && eventToDelete.type === 'custom') {
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
  }
  
  return null;
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
