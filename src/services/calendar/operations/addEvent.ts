
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { EventDataForSupabase } from '../types';
import { mapToCalendarEvent } from '../utils/eventMapper';

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
