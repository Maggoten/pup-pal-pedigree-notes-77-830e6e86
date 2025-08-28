
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { getActivePregnancies } from '@/services/PregnancyService';
import i18n from '@/i18n';

/**
 * Service to synchronize reminders with calendar events
 * Ensures that when reminders are created, corresponding calendar events are also created
 */
export class ReminderCalendarSyncService {
  // Helper method to get translation with fallback
  private static t(key: string, options?: any): string {
    return i18n.t(key, { ...options, ns: 'dogs' }) as string;
  }

  /**
   * Clean up all calendar events for a specific dog before syncing new ones
   * This prevents duplicate events when dog data is updated
   * @param dogId The ID of the dog for which to clean up events
   * @returns A boolean indicating whether the operation was successful
   */
  static async cleanupCalendarEventsForDog(dogId: string): Promise<boolean> {
    try {
      console.log(`Cleaning up all calendar events for dog ID: ${dogId}`);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('dog_id', dogId);

      if (error) {
        console.error('Error cleaning up calendar events for dog:', error);
        return false;
      }

      console.log(`Successfully cleaned up all calendar events for dog ID ${dogId}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in cleanupCalendarEventsForDog:', error);
      return false;
    }
  }

  /**
   * Clean up specific types of calendar events for a dog
   * @param dogId The ID of the dog
   * @param eventTypes Array of event types to clean up
   * @returns A boolean indicating whether the operation was successful
   */
  static async cleanupSpecificEventTypes(dogId: string, eventTypes: string[]): Promise<boolean> {
    try {
      console.log(`Cleaning up specific event types for dog ID: ${dogId}`, eventTypes);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('dog_id', dogId)
        .in('type', eventTypes);

      if (error) {
        console.error('Error cleaning up specific event types:', error);
        return false;
      }

      console.log(`Successfully cleaned up event types ${eventTypes.join(', ')} for dog ID ${dogId}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in cleanupSpecificEventTypes:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for dog birthday reminders with cleanup
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

      // Clean up existing birthday events first
      await this.cleanupSpecificEventTypes(dog.id, ['birthday', 'birthday-reminder']);

      const birthDate = typeof dog.dateOfBirth === 'string' ? 
        new Date(dog.dateOfBirth) : dog.dateOfBirth;

      // Get current year's birthday (keep month and day, update year)
      const currentYear = new Date().getFullYear();
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      const thisYearBirthday = new Date(currentYear, birthMonth, birthDay);
      
      // If the birthday already passed this year, use next year
      const targetDate = thisYearBirthday < new Date() ? 
        new Date(currentYear + 1, birthMonth, birthDay) : 
        thisYearBirthday;

      // Create main birthday event
      const eventData = {
        title: this.t('events.birthday.title', { dogName: dog.name }),
        date: targetDate.toISOString(),
        type: 'birthday',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: this.t('events.birthday.description', { dogName: dog.name }),
        user_id: userId
      };

      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(eventData);

      if (insertError) {
        console.error('Error creating birthday calendar event:', insertError);
        return false;
      }

      // Create reminder event 7 days before
      const reminderDate = addDays(targetDate, -7);
      
      const reminderEventData = {
        title: this.t('events.birthday.reminder', { dogName: dog.name }),
        date: reminderDate.toISOString(),
        type: 'birthday-reminder',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: this.t('events.birthday.reminderDescription', { dogName: dog.name }),
        user_id: userId
      };

      const { error: reminderInsertError } = await supabase
        .from('calendar_events')
        .insert(reminderEventData);

      if (reminderInsertError) {
        console.error('Error creating birthday reminder calendar event:', reminderInsertError);
        return false;
      }

      console.log(`Successfully synced birthday events for ${dog.name}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncBirthdayEvents:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for dog vaccination reminders with cleanup
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

      // Clean up existing vaccination events first
      await this.cleanupSpecificEventTypes(dog.id, ['vaccination', 'vaccination-reminder']);

      const vaccinationDate = typeof dog.vaccinationDate === 'string' ? 
        new Date(dog.vaccinationDate) : dog.vaccinationDate;

      // Calculate next vaccination date (one year from last vaccination)
      const nextVaccinationDate = new Date(vaccinationDate);
      nextVaccinationDate.setFullYear(nextVaccinationDate.getFullYear() + 1);

      // If next vaccination date is in the past, add another year
      if (nextVaccinationDate < new Date()) {
        nextVaccinationDate.setFullYear(nextVaccinationDate.getFullYear() + 1);
      }

      // Create main vaccination event
      const eventData = {
        title: this.t('events.vaccination.title', { dogName: dog.name }),
        date: nextVaccinationDate.toISOString(),
        type: 'vaccination',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: this.t('events.vaccination.description', { dogName: dog.name }),
        user_id: userId
      };

      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(eventData);

      if (insertError) {
        console.error('Error creating vaccination calendar event:', insertError);
        return false;
      }

      // Create reminder event 7 days before
      const reminderDate = addDays(nextVaccinationDate, -7);
      
      const reminderEventData = {
        title: this.t('events.vaccination.reminder', { dogName: dog.name }),
        date: reminderDate.toISOString(),
        type: 'vaccination-reminder',
        dog_id: dog.id,
        dog_name: dog.name,
        notes: this.t('events.vaccination.reminderDescription', { dogName: dog.name }),
        user_id: userId
      };

      const { error: reminderInsertError } = await supabase
        .from('calendar_events')
        .insert(reminderEventData);

      if (reminderInsertError) {
        console.error('Error creating vaccination reminder calendar event:', reminderInsertError);
        return false;
      }

      console.log(`Successfully synced vaccination events for ${dog.name}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncVaccinationEvents:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for upcoming heat cycles with cleanup
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

      // Clean up existing heat events for this dog first
      await this.cleanupSpecificEventTypes(heat.dogId, ['heat', 'heat-reminder']);

      // Create main heat cycle event
      const eventData = {
        title: this.t('events.heat.title', { dogName: heat.dogName }),
        date: heat.date.toISOString(),
        type: 'heat',
        dog_id: heat.dogId,
        dog_name: heat.dogName,
        notes: this.t('events.heat.description', { dogName: heat.dogName }),
        status: 'predicted',
        user_id: userId
      };

      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(eventData);

      if (insertError) {
        console.error('Error creating heat cycle calendar event:', insertError);
        return false;
      }

      // Create reminder event 30 days before
      const reminderDate = addDays(heat.date, -30);

      const reminderEventData = {
        title: this.t('events.heat.reminder', { dogName: heat.dogName }),
        date: reminderDate.toISOString(),
        type: 'heat-reminder',
        dog_id: heat.dogId,
        dog_name: heat.dogName,
        notes: this.t('events.heat.reminderDescription', { dogName: heat.dogName }),
        user_id: userId
      };

      const { error: reminderInsertError } = await supabase
        .from('calendar_events')
        .insert(reminderEventData);

      if (reminderInsertError) {
        console.error('Error creating heat reminder calendar event:', reminderInsertError);
        return false;
      }

      console.log(`Successfully synced heat cycle events for ${heat.dogName}`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncHeatCycleEvents:', error);
      return false;
    }
  }

  /**
   * Bulk sync all calendar events based on dog data with cleanup
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
      
      // Sync due date events for active pregnancies
      await this.syncDueDateEvents();
      
      return true;
    } catch (error) {
      console.error('Error in bulkSyncCalendarEvents:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for due dates from active pregnancies with cleanup
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncDueDateEvents(): Promise<boolean> {
    try {
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for due date calendar events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      // Get active pregnancies
      const activePregnancies = await getActivePregnancies();
      
      if (!activePregnancies || activePregnancies.length === 0) {
        console.log('No active pregnancies found for due date events');
        return true;
      }

      // Clean up existing due-date events to prevent duplicates
      const { error: cleanupError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'due-date');

      if (cleanupError) {
        console.error('Error cleaning up existing due-date events:', cleanupError);
        return false;
      }

      // Create due date events for each active pregnancy
      for (const pregnancy of activePregnancies) {
        const eventData = {
          title: this.t('events.dueDate.title', { femaleName: pregnancy.femaleName }),
          date: pregnancy.expectedDueDate instanceof Date ? 
            pregnancy.expectedDueDate.toISOString() : 
            new Date(pregnancy.expectedDueDate).toISOString(),
          type: 'due-date',
          dog_name: pregnancy.femaleName,
          notes: this.t('events.dueDate.description', { 
            femaleName: pregnancy.femaleName, 
            maleName: pregnancy.maleName 
          }),
          user_id: userId
        };

        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error('Error creating due date calendar event:', insertError);
          return false;
        }
      }

      console.log(`Successfully synced ${activePregnancies.length} due date events`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncDueDateEvents:', error);
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
    return await this.cleanupCalendarEventsForDog(dogId);
  }

  /**
   * Remove orphaned calendar events that have no corresponding dog
   * @returns A boolean indicating whether the operation was successful
   */
  static async cleanupOrphanedEvents(): Promise<boolean> {
    try {
      console.log('Starting cleanup of orphaned calendar events');
      
      // Get all calendar events with dog_id that don't have corresponding dogs
      const { data: orphanedEvents, error: selectError } = await supabase
        .from('calendar_events')
        .select('id, dog_id, title')
        .not('dog_id', 'is', null);

      if (selectError) {
        console.error('Error finding orphaned events:', selectError);
        return false;
      }

      if (!orphanedEvents || orphanedEvents.length === 0) {
        console.log('No orphaned events found');
        return true;
      }

      // Check which events are actually orphaned by verifying dog existence
      const dogIds = [...new Set(orphanedEvents.map(event => event.dog_id))];
      const { data: existingDogs, error: dogError } = await supabase
        .from('dogs')
        .select('id')
        .in('id', dogIds);

      if (dogError) {
        console.error('Error checking existing dogs:', dogError);
        return false;
      }

      const existingDogIds = new Set(existingDogs?.map(dog => dog.id) || []);
      const orphanedEventIds = orphanedEvents
        .filter(event => !existingDogIds.has(event.dog_id))
        .map(event => event.id);

      if (orphanedEventIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('calendar_events')
          .delete()
          .in('id', orphanedEventIds);

        if (deleteError) {
          console.error('Error deleting orphaned events:', deleteError);
          return false;
        }

        console.log(`Successfully deleted ${orphanedEventIds.length} orphaned calendar events`);
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in cleanupOrphanedEvents:', error);
      return false;
    }
  }
}
