import { format, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent } from '@/types/calendar';
import { UpcomingHeat } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';

// Helper to format a date as YYYY-MM-DD
const formatISODate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export class ReminderCalendarSyncService {
  /**
   * Sync heat cycle events to the calendar
   */
  static async syncHeatCycleEvents(heat: UpcomingHeat): Promise<void> {
    try {
      // Get the existing heat event for this dog
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', heat.dogId)
        .eq('type', 'heat');
      
      if (fetchError) {
        console.error('Error fetching existing heat events:', fetchError);
        return;
      }
      
      // Create or update the heat event
      const heatDate = heat.expectedDate;
      const formattedDate = formatISODate(new Date(heatDate));
      
      // If there's an existing event, update it
      if (existingEvents && existingEvents.length > 0) {
        const existingEvent = existingEvents[0];
        
        await supabase
          .from('calendar_events')
          .update({
            title: `Heat Cycle: ${heat.dogName}`,
            date: formattedDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEvent.id);
      } 
      // Otherwise create a new event
      else {
        await supabase
          .from('calendar_events')
          .insert({
            id: uuidv4(),
            title: `Heat Cycle: ${heat.dogName}`,
            date: formattedDate, 
            type: 'heat',
            dog_id: heat.dogId,
            dog_name: heat.dogName
          });
      }
    } catch (error) {
      console.error('Error syncing heat cycle event:', error);
    }
  }
}
