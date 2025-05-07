
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';

/**
 * Service to synchronize reminders with calendar events
 * Ensures that when reminders are created, corresponding calendar events are also created
 */
export class ReminderCalendarSyncService {
  /**
   * Creates calendar events for dog birthday reminders
   * @param dog The dog for which to create birthday calendar events
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncBirthdayEvents(dog: Dog): Promise<boolean> {
    try {
      if (!dog.id || !dog.dateOfBirth || !dog.name) {
        console.log('Missing required dog data for birthday events:', { 
          id: dog.id, 
          name: dog.name, 
          dateOfBirth: dog.dateOfBirth 
        });
        return false;
      }

      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for calendar events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      const eventId = `event-birthday-${dog.id}`;
      const birthDate = typeof dog.dateOfBirth === 'string' ? 
        new Date(dog.dateOfBirth) : dog.dateOfBirth;

      // First, check if event already exists
      const { data: existingEvents } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('type', 'birthday')
        .eq('dog_id', dog.id);

      // Get current year's birthday (keep month and day, update year)
      const currentYear = new Date().getFullYear();
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      const thisYearBirthday = new Date(currentYear, birthMonth, birthDay);
      
      // If the birthday already passed this year, use next year
      const targetDate = thisYearBirthday < new Date() ? 
        new Date(currentYear + 1, birthMonth, birthDay) : 
        thisYearBirthday;

      const eventData = {
        title: `${dog.name}'s Birthday`,
        date: targetDate.toISOString(),
        type: 'birthday',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: `Birthday celebration for ${dog.name}`,
        user_id: userId
      };

      // If event exists, update it
      if (existingEvents && existingEvents.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', existingEvents[0].id);

        if (updateError) {
          console.error('Error updating birthday calendar event:', updateError);
          return false;
        }
      } else {
        // Otherwise create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error('Error creating birthday calendar event:', insertError);
          return false;
        }
      }

      // Create reminder event 14 days before (if not already exists)
      const reminderDate = addDays(targetDate, -14);
      const reminderId = `event-birthday-reminder-${dog.id}`;
      
      const { data: existingReminders } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('type', 'birthday-reminder')
        .eq('dog_id', dog.id);

      const reminderEventData = {
        title: `Prepare for ${dog.name}'s Birthday`,
        date: reminderDate.toISOString(),
        type: 'birthday-reminder',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: `Reminder to prepare for ${dog.name}'s birthday in 2 weeks`,
        user_id: userId
      };

      if (existingReminders && existingReminders.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(reminderEventData)
          .eq('id', existingReminders[0].id);

        if (updateError) {
          console.error('Error updating birthday reminder calendar event:', updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(reminderEventData);

        if (insertError) {
          console.error('Error creating birthday reminder calendar event:', insertError);
          return false;
        }
      }

      console.log(`Successfully synced birthday events for ${dog.name}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncBirthdayEvents:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for dog vaccination reminders
   * @param dog The dog for which to create vaccination calendar events
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncVaccinationEvents(dog: Dog): Promise<boolean> {
    try {
      if (!dog.id || !dog.vaccinationDate || !dog.name) {
        console.log('Missing required dog data for vaccination events:', { 
          id: dog.id, 
          name: dog.name, 
          vaccinationDate: dog.vaccinationDate 
        });
        return false;
      }
      
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for calendar events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      const eventId = `event-vaccination-${dog.id}`;
      const vaccinationDate = typeof dog.vaccinationDate === 'string' ? 
        new Date(dog.vaccinationDate) : dog.vaccinationDate;

      // First, check if event already exists for next vaccination
      const { data: existingEvents } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('type', 'vaccination')
        .eq('dog_id', dog.id);

      // Calculate next vaccination date (one year from last vaccination)
      const nextVaccinationDate = new Date(vaccinationDate);
      nextVaccinationDate.setFullYear(nextVaccinationDate.getFullYear() + 1);

      // If next vaccination date is in the past, add another year
      if (nextVaccinationDate < new Date()) {
        nextVaccinationDate.setFullYear(nextVaccinationDate.getFullYear() + 1);
      }

      const eventData = {
        title: `${dog.name}'s Vaccination Due`,
        date: nextVaccinationDate.toISOString(),
        type: 'vaccination',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: `Annual vaccination due for ${dog.name}`,
        user_id: userId
      };

      // If event exists, update it
      if (existingEvents && existingEvents.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', existingEvents[0].id);

        if (updateError) {
          console.error('Error updating vaccination calendar event:', updateError);
          return false;
        }
      } else {
        // Otherwise create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error('Error creating vaccination calendar event:', insertError);
          return false;
        }
      }

      // Create reminder event 14 days before (if not already exists)
      const reminderDate = addDays(nextVaccinationDate, -14);
      const reminderId = `event-vaccination-reminder-${dog.id}`;
      
      const { data: existingReminders } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('type', 'vaccination-reminder')
        .eq('dog_id', dog.id);

      const reminderEventData = {
        title: `Vaccination Reminder for ${dog.name}`,
        date: reminderDate.toISOString(),
        type: 'vaccination-reminder',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: `Reminder to schedule vaccination for ${dog.name} in 2 weeks`,
        user_id: userId
      };

      if (existingReminders && existingReminders.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(reminderEventData)
          .eq('id', existingReminders[0].id);

        if (updateError) {
          console.error('Error updating vaccination reminder calendar event:', updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(reminderEventData);

        if (insertError) {
          console.error('Error creating vaccination reminder calendar event:', insertError);
          return false;
        }
      }

      console.log(`Successfully synced vaccination events for ${dog.name}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncVaccinationEvents:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for upcoming heat cycles
   * @param heat The upcoming heat cycle for which to create calendar events
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncHeatCycleEvents(heat: UpcomingHeat): Promise<boolean> {
    try {
      if (!heat.dogId || !heat.dogName || !heat.date) {
        console.log('Missing required heat data for events:', heat);
        return false;
      }
      
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for calendar events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      const eventId = `event-heat-${heat.dogId}-${heat.date.getTime()}`;
      
      // First, check if event already exists
      const { data: existingEvents } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('type', 'heat')
        .eq('dog_id', heat.dogId)
        .eq('date', heat.date.toISOString());

      const eventData = {
        title: `${heat.dogName}'s Heat Cycle`,
        date: heat.date.toISOString(),
        type: 'heat',
        dog_id: heat.dogId,
        dog_name: heat.dogName,
        notes: `Expected heat cycle for ${heat.dogName}`,
        user_id: userId
      };

      // If event exists, update it
      if (existingEvents && existingEvents.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', existingEvents[0].id);

        if (updateError) {
          console.error('Error updating heat cycle calendar event:', updateError);
          return false;
        }
      } else {
        // Otherwise create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error('Error creating heat cycle calendar event:', insertError);
          return false;
        }
      }

      // Create reminder event 14 days before (if not already exists)
      const reminderDate = addDays(heat.date, -14);
      const reminderId = `event-heat-reminder-${heat.dogId}-${heat.date.getTime()}`;

      const { data: existingReminders } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('type', 'heat-reminder')
        .eq('dog_id', heat.dogId)
        .eq('date', reminderDate.toISOString());

      const reminderEventData = {
        title: `Upcoming Heat for ${heat.dogName}`,
        date: reminderDate.toISOString(),
        type: 'heat-reminder',
        dog_id: heat.dogId,
        dog_name: heat.dogName,
        notes: `Reminder about ${heat.dogName}'s upcoming heat cycle in 2 weeks`,
        user_id: userId
      };

      if (existingReminders && existingReminders.length > 0) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(reminderEventData)
          .eq('id', existingReminders[0].id);

        if (updateError) {
          console.error('Error updating heat reminder calendar event:', updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(reminderEventData);

        if (insertError) {
          console.error('Error creating heat reminder calendar event:', insertError);
          return false;
        }
      }

      console.log(`Successfully synced heat cycle events for ${heat.dogName}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncHeatCycleEvents:', error);
      return false;
    }
  }

  /**
   * Bulk sync all calendar events based on dog data
   * @param dogs Array of dogs to create calendar events for
   * @returns A boolean indicating whether the operation was successful
   */
  static async bulkSyncCalendarEvents(dogs: Dog[]): Promise<boolean> {
    try {
      for (const dog of dogs) {
        // Only sync if the dog has the necessary data
        if (dog.dateOfBirth) {
          await this.syncBirthdayEvents(dog);
        }
        
        if (dog.vaccinationDate) {
          await this.syncVaccinationEvents(dog);
        }
        
        // Handle heat cycles for female dogs
        if (dog.gender === 'female' && dog.heatHistory && dog.heatHistory.length > 0) {
          const upcomingHeats = await this.getUpcomingHeats([dog]);
          for (const heat of upcomingHeats) {
            await this.syncHeatCycleEvents(heat);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in bulkSyncCalendarEvents:', error);
      return false;
    }
  }

  /**
   * Helper function to calculate upcoming heats for dogs
   * @param dogs Array of dogs to calculate upcoming heats for
   * @returns Array of upcoming heat objects
   */
  private static async getUpcomingHeats(dogs: Dog[]): Promise<UpcomingHeat[]> {
    // Import the calculateUpcomingHeats function dynamically
    // to avoid import cycles
    const { calculateUpcomingHeats } = await import('@/utils/heatCalculator');
    return calculateUpcomingHeats(dogs);
  }

  /**
   * Delete all calendar events related to a dog
   * @param dogId The ID of the dog for which to delete events
   * @returns A boolean indicating whether the operation was successful
   */
  static async deleteCalendarEventsForDog(dogId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('dog_id', dogId);

      if (error) {
        console.error('Error deleting calendar events for dog:', error);
        return false;
      }

      console.log(`Successfully deleted all calendar events for dog ID ${dogId}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in deleteCalendarEventsForDog:', error);
      return false;
    }
  }
}
