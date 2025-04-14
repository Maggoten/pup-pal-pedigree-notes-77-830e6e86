
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/components/calendar/types';
import { mapToCalendarEvent } from '../utils/eventMapper';

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
