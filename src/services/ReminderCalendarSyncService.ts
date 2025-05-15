
import { supabase } from '@/integrations/supabase/client';
import { UpcomingHeat, Reminder } from '@/types/reminders';
import { Dog } from '@/types/dogs';
import { addDays, format, addYears } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // Always use string for Supabase
  time?: string;
  type: string;
  dog_id?: string;
  dog_name?: string;
  notes?: string;
  user_id: string; // Required for Supabase
}

export class ReminderCalendarSyncService {
  /**
   * Sync heat cycle events to the calendar
   */
  static async syncHeatCycleEvents(upcomingHeat: UpcomingHeat): Promise<boolean> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get user for heat cycle events:', userError);
        return false;
      }
      
      // Create event object for the calendar
      const calendarEvent: CalendarEvent = {
        title: `Heat Cycle for ${upcomingHeat.dogName || 'Unknown Dog'}`,
        date: upcomingHeat.date ? upcomingHeat.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: 'heat',
        dog_id: upcomingHeat.dogId,
        dog_name: upcomingHeat.dogName,
        notes: `Expected heat cycle for ${upcomingHeat.dogName}`,
        user_id: user.id,
      };
      
      // Check if event already exists
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('type', 'heat')
        .eq('dog_id', upcomingHeat.dogId);
        
      if (fetchError) {
        console.error('Failed to fetch existing heat events:', fetchError);
        return false;
      }
      
      // If event exists, update it
      if (existingEvents && existingEvents.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update({
            title: calendarEvent.title,
            date: calendarEvent.date,
            notes: calendarEvent.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEvents[0].id);
          
        if (updateError) {
          console.error('Failed to update heat calendar event:', updateError);
          return false;
        }
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert([calendarEvent]);
          
        if (insertError) {
          console.error('Failed to create heat calendar event:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing heat cycle events:', error);
      return false;
    }
  }
  
  /**
   * Sync birthday events to the calendar
   */
  static async syncBirthdayEvents(dog: Dog): Promise<boolean> {
    try {
      if (!dog.dateOfBirth) {
        return false;
      }
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get user for birthday events:', userError);
        return false;
      }
      
      // Create event object for the calendar
      const calendarEvent: CalendarEvent = {
        title: `${dog.name}'s Birthday`,
        date: dog.dateOfBirth.split('T')[0], // Use date without time
        type: 'birthday',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: `Annual birthday for ${dog.name}`,
        user_id: user.id,
      };
      
      // Check if event already exists
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('type', 'birthday')
        .eq('dog_id', dog.id);
        
      if (fetchError) {
        console.error('Failed to fetch existing birthday events:', fetchError);
        return false;
      }
      
      // If event exists, update it
      if (existingEvents && existingEvents.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update({
            title: calendarEvent.title,
            date: calendarEvent.date,
            notes: calendarEvent.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEvents[0].id);
          
        if (updateError) {
          console.error('Failed to update birthday calendar event:', updateError);
          return false;
        }
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert([calendarEvent]);
          
        if (insertError) {
          console.error('Failed to create birthday calendar event:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing birthday events:', error);
      return false;
    }
  }
  
  /**
   * Sync vaccination events to the calendar
   */
  static async syncVaccinationEvents(dog: Dog): Promise<boolean> {
    try {
      if (!dog.vaccinationDate) {
        return false;
      }
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get user for vaccination events:', userError);
        return false;
      }
      
      // Create event object for the calendar
      const calendarEvent: CalendarEvent = {
        title: `${dog.name}'s Vaccination Due`,
        date: dog.vaccinationDate.split('T')[0], // Use date without time
        type: 'vaccination',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: `Vaccination due for ${dog.name}`,
        user_id: user.id,
      };
      
      // Check if event already exists
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('type', 'vaccination')
        .eq('dog_id', dog.id);
        
      if (fetchError) {
        console.error('Failed to fetch existing vaccination events:', fetchError);
        return false;
      }
      
      // If event exists, update it
      if (existingEvents && existingEvents.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update({
            title: calendarEvent.title,
            date: calendarEvent.date,
            notes: calendarEvent.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEvents[0].id);
          
        if (updateError) {
          console.error('Failed to update vaccination calendar event:', updateError);
          return false;
        }
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert([calendarEvent]);
          
        if (insertError) {
          console.error('Failed to create vaccination calendar event:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing vaccination events:', error);
      return false;
    }
  }
}
