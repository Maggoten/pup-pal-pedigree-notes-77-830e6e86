
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { mapToCalendarEvent } from '../utils/eventMapper';

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
