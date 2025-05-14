
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/types/dogs';
import { toast } from '@/components/ui/use-toast';

// Map event types to colors with softer tones
const eventTypeColors = {
  'heat': 'bg-rose-200 text-rose-800 border-rose-300',
  'mating': 'bg-violet-100 text-violet-800 border-violet-200',
  'due-date': 'bg-amber-100 text-amber-800 border-amber-200',
  'vaccination': 'bg-warmgreen-100 text-warmgreen-800 border-warmgreen-200',
  'deworming': 'bg-teal-100 text-teal-800 border-teal-200',
  'birthday': 'bg-blue-100 text-blue-800 border-blue-200',
  'custom': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'planned-mating': 'bg-purple-100 text-purple-800 border-purple-200',
  'vet-visit': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'reminder': 'bg-warmbeige-200 text-darkgray-700 border-warmbeige-300',
  'default': 'bg-warmbeige-100 text-darkgray-800 border-warmbeige-200'
};

// Get the color for an event type
export function getEventColor(type: string): string {
  return eventTypeColors[type] || eventTypeColors.default;
}

// Fetch calendar events for the current user
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return [];
    }
    
    const userId = sessionData.session.user.id;
    
    // Fetch events for the current user
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
    
    // Convert database results to CalendarEvent objects
    const events: CalendarEvent[] = data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      startDate: new Date(event.date), // Add required startDate
      endDate: new Date(event.date),   // Add required endDate
      type: event.type,
      dogId: event.dog_id || undefined,
      dogName: event.dog_name || undefined,
      notes: event.notes || undefined,
      time: event.time || undefined
    }));
    
    return events;
  } catch (error) {
    console.error('Error in fetchCalendarEvents:', error);
    return [];
  }
}

// Add a new event to Supabase
export async function addEventToSupabase(
  data: AddEventFormValues,
  dogs: Dog[]
): Promise<CalendarEvent | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Find selected dog if applicable
    const selectedDog = data.dogId ? dogs.find(dog => dog.id === data.dogId) : null;
    
    // Prepare the event data
    const eventData = {
      title: data.title,
      date: data.date.toISOString(),
      type: 'custom', // All user-added events are custom type
      dog_id: data.dogId || null,
      dog_name: selectedDog ? selectedDog.name : null,
      notes: data.notes || null,
      time: data.time || null,
      user_id: userId // Always set user_id for proper filtering
    };
    
    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add calendar event',
        variant: 'destructive'
      });
      return null;
    }
    
    toast({
      title: 'Event Added',
      description: 'Calendar event has been added successfully'
    });
    
    // Convert the result to a CalendarEvent
    return {
      id: result.id,
      title: result.title,
      date: new Date(result.date),
      startDate: new Date(result.date), // Add required startDate
      endDate: new Date(result.date),   // Add required endDate
      type: result.type,
      dogId: result.dog_id || undefined,
      dogName: result.dog_name || undefined,
      notes: result.notes || undefined,
      time: result.time || undefined
    };
  } catch (error) {
    console.error('Error in addEventToSupabase:', error);
    return null;
  }
}

// Update an existing event
export async function updateEventInSupabase(
  eventId: string,
  data: AddEventFormValues,
  dogs: Dog[]
): Promise<CalendarEvent | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Find selected dog if applicable
    const selectedDog = data.dogId ? dogs.find(dog => dog.id === data.dogId) : null;
    
    // Prepare the event data
    const eventData = {
      title: data.title,
      date: data.date.toISOString(),
      dog_id: data.dogId || null,
      dog_name: selectedDog ? selectedDog.name : null,
      notes: data.notes || null,
      time: data.time || null
    };
    
    // Update in Supabase
    const { data: result, error } = await supabase
      .from('calendar_events')
      .update(eventData)
      .eq('id', eventId)
      .eq('user_id', userId) // Ensure we only update the user's own events
      .select()
      .single();
      
    if (error) {
      console.error('Error updating calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update calendar event',
        variant: 'destructive'
      });
      return null;
    }
    
    toast({
      title: 'Event Updated',
      description: 'Calendar event has been updated successfully'
    });
    
    // Convert the result to a CalendarEvent
    return {
      id: result.id,
      title: result.title,
      date: new Date(result.date),
      startDate: new Date(result.date), // Add required startDate
      endDate: new Date(result.date),   // Add required endDate
      type: result.type,
      dogId: result.dog_id || undefined,
      dogName: result.dog_name || undefined,
      notes: result.notes || undefined,
      time: result.time || undefined
    };
  } catch (error) {
    console.error('Error in updateEventInSupabase:', error);
    return null;
  }
}

// Delete an event
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Delete from Supabase
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId); // Ensure we only delete the user's own events
      
    if (error) {
      console.error('Error deleting calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete calendar event',
        variant: 'destructive'
      });
      return false;
    }
    
    toast({
      title: 'Event Deleted',
      description: 'Calendar event has been deleted successfully'
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteEventFromSupabase:', error);
    return false;
  }
}

// Migrate events from localStorage to Supabase (one-time operation)
export async function migrateCalendarEventsFromLocalStorage(dogs: Dog[]): Promise<boolean> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session for migration:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Check if we already have events in Supabase for this user
    const { data: existingEvents, error: checkError } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking existing events:', checkError);
      return false;
    }
    
    // If we already have events, skip migration
    if (existingEvents && existingEvents.length > 0) {
      console.log('Events already exist in database, skipping migration');
      return true;
    }
    
    // No need to migrate sample events as they shouldn't exist anymore
    console.log('No events to migrate from localStorage');
    return true;
  } catch (error) {
    console.error('Error in migrateCalendarEventsFromLocalStorage:', error);
    return false;
  }
}
