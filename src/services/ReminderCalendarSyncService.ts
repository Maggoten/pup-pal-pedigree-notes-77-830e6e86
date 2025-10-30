
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
    return i18n.t(key, { ...options, ns: 'home' }) as string;
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
      }
      
      // Sync mating date events from planned litters
      await this.syncMatingDateEvents();
      
      // Sync due date events for active pregnancies
      await this.syncDueDateEvents();
      
      // Sync predicted heat events for upcoming heats
      await this.syncPredictedHeatEvents(dogs);
      
      // Sync active heat cycles to calendar
      await this.syncActiveHeatCyclesToCalendar();
      
      return true;
    } catch (error) {
      console.error('Error in bulkSyncCalendarEvents:', error);
      return false;
    }
  }

  /**
   * Clean up calendar events for a specific pregnancy
   * @param pregnancyId The ID of the pregnancy for which to clean up events
   * @returns A boolean indicating whether the operation was successful
   */
  static async cleanupCalendarEventsForPregnancy(pregnancyId: string): Promise<boolean> {
    try {
      console.log(`[ReminderCalendarSyncService] Cleaning up calendar events for pregnancy ID: ${pregnancyId}`);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('pregnancy_id', pregnancyId);

      if (error) {
        console.error('[ReminderCalendarSyncService] Error cleaning up calendar events for pregnancy:', error);
        return false;
      }

      console.log(`[ReminderCalendarSyncService] Successfully cleaned up calendar events for pregnancy ID ${pregnancyId}`);
      return true;
    } catch (error) {
      console.error('[ReminderCalendarSyncService] Unexpected error in cleanupCalendarEventsForPregnancy:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for due dates from active pregnancies with cleanup
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncDueDateEvents(): Promise<boolean> {
    const startTime = Date.now();
    console.log('[ReminderCalendarSyncService] Starting syncDueDateEvents...');
    
    try {
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('[ReminderCalendarSyncService] Error getting user for due date calendar events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      // Get active pregnancies
      const activePregnancies = await getActivePregnancies();
      
      if (!activePregnancies || activePregnancies.length === 0) {
        console.log('[ReminderCalendarSyncService] No active pregnancies found for due date events');
        return true;
      }

      // Clean up existing due-date events to prevent duplicates
      const { error: cleanupError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'due-date');

      if (cleanupError) {
        console.error('[ReminderCalendarSyncService] Error cleaning up existing due-date events:', cleanupError);
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
          pregnancy_id: pregnancy.id, // Link calendar event to pregnancy
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
          console.error('[ReminderCalendarSyncService] Error creating due date calendar event:', insertError);
          return false;
        }
      }

      const elapsed = Date.now() - startTime;
      console.log(`[ReminderCalendarSyncService] Successfully synced ${activePregnancies.length} due date events in ${elapsed}ms`);
      return true;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`[ReminderCalendarSyncService] Unexpected error in syncDueDateEvents after ${elapsed}ms:`, error);
      return false;
    }
  }

  /**
   * Syncs mating date events from mating_dates table to calendar
   * Creates calendar events for all mating dates across all planned litters
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncMatingDateEvents(): Promise<boolean> {
    try {
      console.log('🔄 Starting sync of mating date events...');
      
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for mating date events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      // Clean up existing mating events to prevent duplicates
      const { error: cleanupError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'mating');

      if (cleanupError) {
        console.error('Error cleaning up existing mating events:', cleanupError);
        return false;
      }

      // Fetch all mating dates for this user
      const { data: matingDates, error: fetchError } = await supabase
        .from('mating_dates')
        .select(`
          id,
          mating_date,
          planned_litter_id,
          planned_litters!inner (
            female_name,
            male_name,
            female_id
          )
        `)
        .eq('user_id', userId)
        .order('mating_date', { ascending: false });

      if (fetchError) {
        console.error('Error fetching mating dates:', fetchError);
        return false;
      }

      if (!matingDates || matingDates.length === 0) {
        console.log('✅ No mating dates found to sync');
        return true;
      }

      console.log(`📊 Found ${matingDates.length} mating date(s) to sync`);

      // Create calendar events for each mating date
      const eventsToInsert = matingDates.map(matingDate => {
        const plannedLitter = matingDate.planned_litters as any;
        const femaleName = plannedLitter.female_name;
        const maleName = plannedLitter.male_name;
        
        return {
          title: this.t('events.mating.title', { 
            femaleName, 
            maleName 
          }),
          date: new Date(matingDate.mating_date).toISOString(),
          type: 'mating',
          dog_id: plannedLitter.female_id || undefined,
          dog_name: femaleName,
          notes: this.t('events.mating.description', { 
            femaleName, 
            maleName 
          }),
          user_id: userId
        };
      });

      // Bulk insert all mating events
      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(eventsToInsert);

      if (insertError) {
        console.error('Error creating mating date calendar events:', insertError);
        return false;
      }

      console.log(`✅ Successfully synced ${matingDates.length} mating date event(s)`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncMatingDateEvents:', error);
      return false;
    }
  }

  /**
   * Syncs active heat cycles from heat_cycles table to calendar
   * Creates heat-active calendar events for ongoing heat cycles
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncActiveHeatCyclesToCalendar(): Promise<boolean> {
    try {
      console.log('🔥 Starting sync of active heat cycles to calendar...');
      
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for active heat cycle sync:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      // Get all active heat cycles for this user (end_date is null)
      const { data: activeHeatCycles, error: fetchError } = await supabase
        .from('heat_cycles')
        .select(`
          id,
          dog_id,
          start_date,
          end_date,
          notes,
          cycle_length,
          user_id,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .is('end_date', null);

      if (fetchError) {
        console.error('Error fetching active heat cycles:', fetchError);
        return false;
      }

      if (!activeHeatCycles || activeHeatCycles.length === 0) {
        console.log('✅ No active heat cycles found');
        return true;
      }

      console.log(`📊 Found ${activeHeatCycles.length} active heat cycle(s) to sync`);

      // Import HeatCalendarSyncService for syncing
      const { HeatCalendarSyncService } = await import('./HeatCalendarSyncService');

      // Sync each active heat cycle to calendar
      let successCount = 0;
      for (const heatCycle of activeHeatCycles) {
        try {
          // Get dog name
          const { data: dog, error: dogError } = await supabase
            .from('dogs')
            .select('name')
            .eq('id', heatCycle.dog_id)
            .single();

          if (dogError || !dog) {
            console.error(`Error fetching dog for heat cycle ${heatCycle.id}:`, dogError);
            continue;
          }

          const dogName = dog.name;
          console.log(`⏳ Syncing active heat cycle for ${dogName}...`);

          // Use existing sync function to create calendar events
          const success = await HeatCalendarSyncService.syncHeatCycleToCalendar(
            heatCycle,
            dogName
          );

          if (success) {
            successCount++;
            console.log(`✅ Successfully synced active heat cycle for ${dogName}`);
          } else {
            console.error(`❌ Failed to sync heat cycle for ${dogName}`);
          }
        } catch (error) {
          console.error(`Error processing heat cycle ${heatCycle.id}:`, error);
          // Continue with next heat cycle
        }
      }

      console.log(`🎯 Active heat cycle sync complete: ${successCount}/${activeHeatCycles.length} synced successfully`);
      return successCount === activeHeatCycles.length;
    } catch (error) {
      console.error('Unexpected error in syncActiveHeatCyclesToCalendar:', error);
      return false;
    }
  }

  /**
   * Syncs predicted heat events to calendar for all dogs
   * Creates calendar events for upcoming heats that can be started from the calendar
   * @param dogs Array of dogs to create predicted heat events for
   * @returns A boolean indicating whether the operation was successful
   */
  static async syncPredictedHeatEvents(dogs: Dog[]): Promise<boolean> {
    try {
      console.log(`Starting sync of predicted heat events for ${dogs.length} dogs...`);
      
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Error getting user for predicted heat calendar events:', authError);
        return false;
      }
      
      const userId = authData.user.id;

      // Clean up existing predicted heat events to prevent duplicates
      const { error: cleanupError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'heat')
        .eq('status', 'predicted');

      if (cleanupError) {
        console.error('Error cleaning up existing predicted heat events:', cleanupError);
        return false;
      }

      // Get upcoming heats using the safe calculator
      const upcomingHeats = await this.getUpcomingHeats(dogs);
      
      if (!upcomingHeats || upcomingHeats.length === 0) {
        console.log('No upcoming heats found for predicted heat events');
        return true;
      }

      console.log(`Found ${upcomingHeats.length} upcoming heats to sync to calendar`);

      // Create predicted heat events for each upcoming heat
      for (const upcomingHeat of upcomingHeats) {
        const eventData = {
          title: `${upcomingHeat.dogName}'s Heat Cycle`,
          date: upcomingHeat.date.toISOString(),
          type: 'heat',
          dog_id: upcomingHeat.dogId,
          dog_name: upcomingHeat.dogName,
          notes: `Predicted heat cycle for ${upcomingHeat.dogName}. Click "Start Heat Cycle" when it begins.`,
          user_id: userId,
          status: 'predicted'
        };

        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error(`Error creating predicted heat event for ${upcomingHeat.dogName}:`, insertError);
          // Continue with other events even if one fails
        } else {
          console.log(`✅ Created predicted heat event for ${upcomingHeat.dogName}`);
        }
      }

      console.log(`Successfully synced ${upcomingHeats.length} predicted heat events to calendar`);
      return true;
    } catch (error) {
      console.error('Unexpected error in syncPredictedHeatEvents:', error);
      return false;
    }
  }

  /**
   * Helper function to calculate upcoming heats for dogs
   * @param dogs Array of dogs to calculate upcoming heats for
   * @returns Array of upcoming heat objects
   */
  private static async getUpcomingHeats(dogs: Dog[]): Promise<UpcomingHeat[]> {
    // Use unified calculation directly
    const { calculateUpcomingHeatsUnified } = await import('@/utils/heatCalculator');
    return calculateUpcomingHeatsUnified(dogs);
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
