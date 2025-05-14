import { format, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent } from '@/types/calendar';
import { UpcomingHeat } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';

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
      // Get user ID from session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.error('[ReminderCalendarSyncService] No authenticated user');
        return;
      }
      
      const userId = sessionData.session.user.id;
      
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
            dog_name: heat.dogName,
            user_id: userId
          });
      }
    } catch (error) {
      console.error('Error syncing heat cycle event:', error);
    }
  }
  
  /**
   * Sync birthday events to the calendar
   */
  static async syncBirthdayEvents(dog: Dog): Promise<void> {
    try {
      if (!dog.birthdate) {
        return; // No birthdate to sync
      }
      
      // Get user ID from session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.error('[ReminderCalendarSyncService] No authenticated user');
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Get the existing birthday event for this dog
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', dog.id)
        .eq('type', 'birthday');
        
      if (fetchError) {
        console.error('Error fetching existing birthday events:', fetchError);
        return;
      }
      
      // Format the birthday (just month and day, not year)
      const birthdateObj = new Date(dog.birthdate);
      const currentYear = new Date().getFullYear();
      const thisYearBirthday = new Date(currentYear, birthdateObj.getMonth(), birthdateObj.getDate());
      const formattedDate = formatISODate(thisYearBirthday);
      
      // If there's an existing event, update it
      if (existingEvents && existingEvents.length > 0) {
        const existingEvent = existingEvents[0];
        
        await supabase
          .from('calendar_events')
          .update({
            title: `Birthday: ${dog.name}`,
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
            title: `Birthday: ${dog.name}`,
            date: formattedDate, 
            type: 'birthday',
            dog_id: dog.id,
            dog_name: dog.name,
            notes: `${dog.name}'s birthday celebration`,
            user_id: userId
          });
      }
    } catch (error) {
      console.error('Error syncing birthday event:', error);
    }
  }
  
  /**
   * Sync vaccination events to the calendar
   */
  static async syncVaccinationEvents(dog: Dog): Promise<void> {
    try {
      if (!dog.vaccinationDate) {
        return; // No vaccination date to sync
      }
      
      // Get user ID from session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.error('[ReminderCalendarSyncService] No authenticated user');
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Get the existing vaccination event for this dog
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', dog.id)
        .eq('type', 'vaccination');
        
      if (fetchError) {
        console.error('Error fetching existing vaccination events:', fetchError);
        return;
      }
      
      const formattedDate = formatISODate(new Date(dog.vaccinationDate));
      
      // If there's an existing event, update it
      if (existingEvents && existingEvents.length > 0) {
        const existingEvent = existingEvents[0];
        
        await supabase
          .from('calendar_events')
          .update({
            title: `Vaccination: ${dog.name}`,
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
            title: `Vaccination: ${dog.name}`,
            date: formattedDate, 
            type: 'vaccination',
            dog_id: dog.id,
            dog_name: dog.name,
            notes: `${dog.name}'s vaccination due`,
            user_id: userId
          });
      }
    } catch (error) {
      console.error('Error syncing vaccination event:', error);
    }
  }
}
