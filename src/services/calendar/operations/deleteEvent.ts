
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/components/calendar/types';
import { toast } from '@/components/ui/use-toast';

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
