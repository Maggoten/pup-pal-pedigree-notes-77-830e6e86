
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
   * Smart cleanup that respects event retention policies
   * - PERMANENT events (mating, due-date, birthday, heat-active, vaccination) are NEVER deleted
   * - MEDIUM retention events (predictions, reminders) are kept for 12 months
   * - SHORT retention events (custom) are kept for 6 months
   * 
   * This ensures breeding history is preserved while cleaning up old predictions
   * 
   * @param userId The user ID
   * @param eventTypes Array of event types to clean up
   * @returns A boolean indicating whether the operation was successful
   */
  static async smartCleanupEventTypes(
    userId: string, 
    eventTypes: string[]
  ): Promise<boolean> {
    try {
      // Import config
      const { CalendarConfigHelpers } = await import('@/config/calendarConfig');
      
      // Separate permanent events from temporary ones
      const permanentTypes: string[] = [];
      const temporaryTypes: { type: string; cutoffDate: Date }[] = [];
      
      for (const eventType of eventTypes) {
        const cutoffDate = CalendarConfigHelpers.getCutoffDate(eventType);
        
        if (cutoffDate === null) {
          // This is a permanent event type - DO NOT DELETE
          permanentTypes.push(eventType);
          console.log(`⚠️ Skipping cleanup for permanent event type: ${eventType}`);
        } else {
          // This is a temporary event type - clean up old ones
          temporaryTypes.push({ type: eventType, cutoffDate });
          console.log(`🧹 Will cleanup ${eventType} events older than ${cutoffDate.toISOString()}`);
        }
      }
      
      // Log permanent types that won't be cleaned
      if (permanentTypes.length > 0) {
        console.log(`✅ Preserving permanent event types: ${permanentTypes.join(', ')}`);
      }
      
      // Clean up each temporary event type based on its retention policy
      let cleanupCount = 0;
      for (const { type, cutoffDate } of temporaryTypes) {
        const { error, count } = await supabase
          .from('calendar_events')
          .delete()
          .eq('user_id', userId)
          .eq('type', type)
          .lt('date', cutoffDate.toISOString())
          .select();

        if (error) {
          console.error(`Error cleaning up ${type} events:`, error);
          continue;
        }
        
        if (count && count > 0) {
          cleanupCount += count;
          console.log(`✅ Cleaned up ${count} old ${type} event(s)`);
        }
      }
      
      if (cleanupCount > 0) {
        console.log(`🎯 Smart cleanup complete: Removed ${cleanupCount} old event(s), preserved all permanent events`);
      } else {
        console.log(`✅ Smart cleanup complete: No old events to remove`);
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in smartCleanupEventTypes:', error);
      return false;
    }
  }

  /**
   * Smart cleanup for specific dog events with retention policies
   * @param dogId The ID of the dog
   * @param eventTypes Array of event types to clean up
   * @returns A boolean indicating whether the operation was successful
   */
  static async smartCleanupDogEventTypes(
    dogId: string,
    eventTypes: string[]
  ): Promise<boolean> {
    try {
      const { CalendarConfigHelpers } = await import('@/config/calendarConfig');
      
      const permanentTypes: string[] = [];
      const temporaryTypes: { type: string; cutoffDate: Date }[] = [];
      
      for (const eventType of eventTypes) {
        const cutoffDate = CalendarConfigHelpers.getCutoffDate(eventType);
        
        if (cutoffDate === null) {
          permanentTypes.push(eventType);
        } else {
          temporaryTypes.push({ type: eventType, cutoffDate });
        }
      }
      
      // Clean up temporary events only
      for (const { type, cutoffDate } of temporaryTypes) {
        await supabase
          .from('calendar_events')
          .delete()
          .eq('dog_id', dogId)
          .eq('type', type)
          .lt('date', cutoffDate.toISOString());
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in smartCleanupDogEventTypes:', error);
      return false;
    }
  }

  /**
   * Creates calendar events for dog birthday reminders with cleanup
   * IMPORTANT: Birthdays are PERMANENT events and never deleted
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

      // IMPORTANT: Birthdays are PERMANENT events and should never be deleted
      // We only remove duplicate birthday events for the same dog/year combination
      // This preserves historical birthday data while preventing duplicates

      const birthDate = typeof dog.dateOfBirth === 'string' ? 
        new Date(dog.dateOfBirth) : dog.dateOfBirth;

      const currentYear = new Date().getFullYear();
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      const currentDate = new Date();

      // Calculate this year's birthday
      const thisYearBirthday = new Date(currentYear, birthMonth, birthDay);

      // Calculate next year's birthday
      const nextYearBirthday = new Date(currentYear + 1, birthMonth, birthDay);

      // Grace period: Show recent birthdays (within 3 days)
      const gracePeriod = new Date();
      gracePeriod.setDate(gracePeriod.getDate() - 3);

      // Always create current year's birthday if:
      // 1. It's in the future, OR
      // 2. It happened within the grace period (last 3 days)
      const shouldCreateCurrentYear = thisYearBirthday >= gracePeriod;

      if (shouldCreateCurrentYear) {
        // Check if current year event already exists
        const { data: existingCurrentYear } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('user_id', userId)
          .eq('dog_id', dog.id)
          .eq('type', 'birthday')
          .gte('date', thisYearBirthday.toISOString())
          .lt('date', new Date(thisYearBirthday.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingCurrentYear) {
          const currentYearEventData = {
            title: this.t('events.birthday.title', { dogName: dog.name }),
            date: thisYearBirthday.toISOString(),
            type: 'birthday',
            dog_id: dog.id,
            dog_name: dog.name,
            notes: this.t('events.birthday.description', { dogName: dog.name }),
            user_id: userId
          };

          await supabase.from('calendar_events').insert(currentYearEventData);
          console.log(`✅ Created current year birthday for ${dog.name}: ${thisYearBirthday.toISOString()}`);
        }
        
        // Create reminder 7 days before current year birthday
        const currentYearReminder = addDays(thisYearBirthday, -7);
        if (currentYearReminder >= currentDate) {
          const { data: existingReminder } = await supabase
            .from('calendar_events')
            .select('id')
            .eq('user_id', userId)
            .eq('dog_id', dog.id)
            .eq('type', 'birthday-reminder')
            .gte('date', currentYearReminder.toISOString())
            .lt('date', new Date(currentYearReminder.getTime() + 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (!existingReminder) {
            const reminderEventData = {
              title: this.t('events.birthday.reminder', { dogName: dog.name }),
              date: currentYearReminder.toISOString(),
              type: 'birthday-reminder',
              dog_id: dog.id,
              dog_name: dog.name,
              notes: this.t('events.birthday.reminderDescription', { dogName: dog.name }),
              user_id: userId
            };

            await supabase.from('calendar_events').insert(reminderEventData);
          }
        }
      }

      // Always create next year's birthday event
      const { data: existingNextYear } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('user_id', userId)
        .eq('dog_id', dog.id)
        .eq('type', 'birthday')
        .gte('date', nextYearBirthday.toISOString())
        .lt('date', new Date(nextYearBirthday.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (!existingNextYear) {
        const nextYearEventData = {
          title: this.t('events.birthday.title', { dogName: dog.name }),
          date: nextYearBirthday.toISOString(),
          type: 'birthday',
          dog_id: dog.id,
          dog_name: dog.name,
          notes: this.t('events.birthday.description', { dogName: dog.name }),
          user_id: userId
        };

        await supabase.from('calendar_events').insert(nextYearEventData);
        console.log(`✅ Created next year birthday for ${dog.name}: ${nextYearBirthday.toISOString()}`);
        
        // Create reminder 7 days before next year birthday
        const nextYearReminder = addDays(nextYearBirthday, -7);
        
        const { data: existingNextReminder } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('user_id', userId)
          .eq('dog_id', dog.id)
          .eq('type', 'birthday-reminder')
          .gte('date', nextYearReminder.toISOString())
          .lt('date', new Date(nextYearReminder.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingNextReminder) {
          const nextYearReminderData = {
            title: this.t('events.birthday.reminder', { dogName: dog.name }),
            date: nextYearReminder.toISOString(),
            type: 'birthday-reminder',
            dog_id: dog.id,
            dog_name: dog.name,
            notes: this.t('events.birthday.reminderDescription', { dogName: dog.name }),
            user_id: userId
          };

          await supabase.from('calendar_events').insert(nextYearReminderData);
        }
      }

      // Smart cleanup: Remove old birthday REMINDERS (but keep actual birthdays forever)
      await this.smartCleanupDogEventTypes(dog.id, ['birthday-reminder']);

      console.log(`✅ Birthday events synced for ${dog.name} (permanent storage)`);
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

      // IMPORTANT: Vaccination events are PERMANENT (often legally required records)
      // Only clean up old reminders, never actual vaccination events
      await this.smartCleanupDogEventTypes(dog.id, ['vaccination-reminder']);

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

      console.log(`✅ Vaccination events for ${dog.name} are stored permanently`);
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

      // IMPORTANT: Due-date events are PERMANENT and represent birth/production records
      // We do NOT delete existing due-date events, only check for duplicates
      console.log('[ReminderCalendarSyncService] Due-date events are stored permanently - checking for new pregnancies...');

      // Create due date events for each active pregnancy (check for duplicates)
      let newEventCount = 0;
      let skippedCount = 0;

      for (const pregnancy of activePregnancies) {
        const dueDateISO = pregnancy.expectedDueDate instanceof Date ? 
          pregnancy.expectedDueDate.toISOString() : 
          new Date(pregnancy.expectedDueDate).toISOString();
        
        // Check if event already exists for this pregnancy
        const { data: existing } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'due-date')
          .eq('pregnancy_id', pregnancy.id)
          .maybeSingle();
        
        if (existing) {
          skippedCount++;
          console.log(`[ReminderCalendarSyncService] ⏭️  Due-date event already exists for pregnancy ${pregnancy.id}`);
          continue;
        }
        
        // Create new due-date event
        const eventData = {
          title: this.t('events.dueDate.title', { femaleName: pregnancy.femaleName }),
          date: dueDateISO,
          type: 'due-date',
          dog_name: pregnancy.femaleName,
          pregnancy_id: pregnancy.id,
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
          console.error(`[ReminderCalendarSyncService] Error creating due date event for ${pregnancy.femaleName}:`, insertError);
          continue;
        }
        
        newEventCount++;
        console.log(`[ReminderCalendarSyncService] ✅ Created due-date event for ${pregnancy.femaleName}: ${dueDateISO}`);
      }

      console.log(`[ReminderCalendarSyncService] ✅ Due-date sync complete: ${newEventCount} new event(s), ${skippedCount} existing (permanent storage)`);

      const elapsed = Date.now() - startTime;
      console.log(`[ReminderCalendarSyncService] Due-date sync completed in ${elapsed}ms`);
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

      // IMPORTANT: Mating events are PERMANENT and represent critical breeding history
      // We do NOT delete existing mating events, only check for duplicates
      console.log('📝 Mating events are stored permanently - checking for new dates to add...');

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

      // Create calendar events for each mating date (check for duplicates)
      let newEventCount = 0;
      let skippedCount = 0;

      for (const matingDate of matingDates) {
        const plannedLitter = matingDate.planned_litters as any;
        const femaleName = plannedLitter.female_name;
        const maleName = plannedLitter.male_name;
        const matingDateISO = new Date(matingDate.mating_date).toISOString();
        
        // Check if this exact mating event already exists
        const { data: existing } = await supabase
          .from('calendar_events')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'mating')
          .eq('date', matingDateISO)
          .eq('dog_name', femaleName)
          .maybeSingle();
        
        if (existing) {
          skippedCount++;
          console.log(`⏭️  Mating event already exists: ${femaleName} × ${maleName} on ${matingDateISO}`);
          continue;
        }
        
        // Create new mating event
        const eventData = {
          title: this.t('events.mating.title', { 
            femaleName, 
            maleName 
          }),
          date: matingDateISO,
          type: 'mating',
          dog_id: plannedLitter.female_id || undefined,
          dog_name: femaleName,
          notes: this.t('events.mating.description', { 
            femaleName, 
            maleName 
          }),
          user_id: userId
        };
        
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (insertError) {
          console.error(`Error creating mating event for ${femaleName}:`, insertError);
          continue;
        }
        
        newEventCount++;
        console.log(`✅ Created mating event: ${femaleName} × ${maleName} on ${matingDateISO}`);
      }

      console.log(`✅ Mating sync complete: ${newEventCount} new event(s), ${skippedCount} existing (permanent storage)`);
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

      // Clean up old predicted heat events using smart cleanup (12 month retention)
      // Note: Actual heat-active events are permanent and won't be touched
      await this.smartCleanupEventTypes(userId, ['heat']);

      console.log('🧹 Cleaned up old predicted heat events (>12 months), preserved all heat-active events');

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
