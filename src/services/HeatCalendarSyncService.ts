import { supabase } from '@/integrations/supabase/client';
import { HeatService } from './HeatService';
import { ReminderCalendarSyncService } from './ReminderCalendarSyncService';
import { format, addDays } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

/**
 * Service for bilateral synchronization between heat cycles and calendar events
 * Ensures heat journal changes reflect in calendar and vice versa
 */
export class HeatCalendarSyncService {
  
  /**
   * Create calendar events when a heat cycle is created
   */
  static async syncHeatCycleToCalendar(heatCycle: HeatCycle, dogName: string): Promise<boolean> {
    try {
      console.log(`🔄 Starting sync for ${dogName} (${heatCycle.dog_id}):`, {
        start_date: heatCycle.start_date,
        end_date: heatCycle.end_date,
        isActive: !heatCycle.end_date
      });
      
      // Debug: Log the specific heat cycle we're working with
      console.log(`🐕 Processing heat cycle ID: ${heatCycle.id} for dog: ${dogName}`);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('No authenticated user for calendar sync:', authError);
        return false;
      }

      const startDate = new Date(heatCycle.start_date);
      const isActive = !heatCycle.end_date;

      console.log(`🧹 Cleaning up existing events for ${dogName}...`);
      // Clean up existing heat events for this dog to avoid duplicates
      await ReminderCalendarSyncService.cleanupSpecificEventTypes(heatCycle.dog_id, [
        'heat', 'heat-active', 'ovulation-predicted', 'fertility-window'
      ]);

      // Create heat cycle event
      const heatEventData = {
        title: `${dogName} - ${isActive ? 'Active Heat Cycle' : 'Heat Cycle'}`,
        date: startDate.toISOString(),
        end_date: heatCycle.end_date || addDays(startDate, 21).toISOString(),
        type: isActive ? 'heat-active' : 'heat',
        dog_id: heatCycle.dog_id,
        dog_name: dogName,
        notes: heatCycle.notes || undefined,
        user_id: user.id,
        status: isActive ? 'active' : 'ended',
        heat_phase: isActive ? 'proestrus' : undefined
      };

      console.log(`📅 Creating calendar event for ${dogName}:`, {
        type: heatEventData.type,
        title: heatEventData.title,
        date: heatEventData.date,
        status: heatEventData.status
      });

      const { error: heatEventError } = await supabase
        .from('calendar_events')
        .insert(heatEventData);

      if (heatEventError) {
        console.error('❌ Error creating heat calendar event:', heatEventError);
        return false;
      }

      console.log(`✅ Successfully created ${heatEventData.type} event for ${dogName}`);

      // If active heat cycle, create predictive events
      if (isActive) {
        console.log(`🔮 Creating predictive events for active heat cycle...`);
        await this.createPredictiveHeatEvents(heatCycle, dogName, user.id);
      }

      console.log(`✅ Successfully synced heat cycle to calendar for ${dogName}`);
      return true;
    } catch (error) {
      console.error('Error in syncHeatCycleToCalendar:', error);
      return false;
    }
  }

  /**
   * Create predictive events for active heat cycles (ovulation, fertility window)
   */
  private static async createPredictiveHeatEvents(
    heatCycle: HeatCycle, 
    dogName: string, 
    userId: string
  ): Promise<void> {
    const startDate = new Date(heatCycle.start_date);

    // Create ovulation prediction (days 12-14, peak at day 13)
    const ovulationDate = addDays(startDate, 12);
    const ovulationEventData = {
      title: `${dogName} - Predicted Ovulation`,
      date: ovulationDate.toISOString(),
      type: 'ovulation-predicted',
      dog_id: heatCycle.dog_id,
      dog_name: dogName,
      notes: 'Peak fertility window (days 12-14 of heat cycle)',
      user_id: userId,
      status: 'predicted'
    };

    await supabase.from('calendar_events').insert(ovulationEventData);

    // Create fertility window (days 10-16)
    const fertilityStart = addDays(startDate, 9); // Day 10
    const fertilityEnd = addDays(startDate, 15);   // Day 16
    const fertilityEventData = {
      title: `${dogName} - Fertility Window`,
      date: fertilityStart.toISOString(),
      end_date: fertilityEnd.toISOString(),
      type: 'fertility-window',
      dog_id: heatCycle.dog_id,
      dog_name: dogName,
      notes: 'Optimal breeding window (days 10-16 of heat cycle)',
      user_id: userId,
      status: 'active'
    };

    await supabase.from('calendar_events').insert(fertilityEventData);
  }

  /**
   * Update calendar events when heat cycle is updated
   */
  static async updateCalendarForHeatCycle(
    heatCycle: HeatCycle, 
    dogName: string, 
    previousData?: Partial<HeatCycle>
  ): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('No authenticated user for calendar update:', authError);
        return false;
      }

      // If start date changed or cycle ended, recreate events
      const startDateChanged = previousData?.start_date && 
        previousData.start_date !== heatCycle.start_date;
      const cycleEnded = !previousData?.end_date && heatCycle.end_date;

      if (startDateChanged || cycleEnded) {
        // Remove old events and create new ones
        await ReminderCalendarSyncService.cleanupSpecificEventTypes(heatCycle.dog_id, [
          'heat', 'heat-active', 'ovulation-predicted', 'fertility-window'
        ]);

        return await this.syncHeatCycleToCalendar(heatCycle, dogName);
      }

      // Otherwise, just update existing heat event
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update({
          title: `${dogName} - ${heatCycle.end_date ? 'Heat Cycle' : 'Active Heat Cycle'}`,
          notes: heatCycle.notes || undefined,
          status: heatCycle.end_date ? 'ended' : 'active',
          end_date: heatCycle.end_date || addDays(new Date(heatCycle.start_date), 21).toISOString()
        })
        .eq('dog_id', heatCycle.dog_id)
        .eq('user_id', user.id)
        .in('type', ['heat', 'heat-active']);

      if (updateError) {
        console.error('Error updating heat calendar events:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateCalendarForHeatCycle:', error);
      return false;
    }
  }

  /**
   * Remove calendar events when heat cycle is deleted
   */
  static async removeCalendarEventsForHeatCycle(dogId: string): Promise<boolean> {
    try {
      return await ReminderCalendarSyncService.cleanupSpecificEventTypes(dogId, [
        'heat', 'heat-active', 'ovulation-predicted', 'fertility-window'
      ]);
    } catch (error) {
      console.error('Error removing calendar events for heat cycle:', error);
      return false;
    }
  }

  /**
   * Create heat cycle when heat is started from calendar
   */
  static async createHeatCycleFromCalendar(
    calendarEvent: CalendarEvent,
    dogId: string
  ): Promise<HeatCycle | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('No authenticated user for heat cycle creation:', authError);
        return null;
      }

      // Check if active heat cycle already exists for this dog
      const existingCycle = await HeatService.getActiveHeatCycle(dogId);
      if (existingCycle) {
        console.log('Active heat cycle already exists for dog:', dogId);
        return existingCycle;
      }

      // Create heat cycle from calendar event
      const startDate = new Date(calendarEvent.date);
      const heatCycle = await HeatService.createHeatCycle(
        dogId,
        startDate,
        calendarEvent.notes || 'Started from calendar'
      );

      if (heatCycle) {
        // Sync back to calendar with predictive events
        const dogName = calendarEvent.dog_name || 'Unknown';
        await this.syncHeatCycleToCalendar(heatCycle, dogName);
      }

      return heatCycle;
    } catch (error) {
      console.error('Error creating heat cycle from calendar:', error);
      return null;
    }
  }

  /**
   * Link existing calendar event to heat cycle
   */
  static async linkCalendarEventToHeatCycle(
    eventId: string,
    heatCycleId: string
  ): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('No authenticated user for linking:', authError);
        return false;
      }

      // Add heat_cycle_id reference to calendar event
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update({ 
          notes: `Linked to heat cycle: ${heatCycleId}` 
        })
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error linking calendar event to heat cycle:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in linkCalendarEventToHeatCycle:', error);
      return false;
    }
  }

  /**
   * Get heat cycle ID from calendar event notes (if linked)
   */
  static extractHeatCycleIdFromEvent(calendarEvent: CalendarEvent): string | null {
    if (!calendarEvent.notes) return null;
    
    const match = calendarEvent.notes.match(/Linked to heat cycle: ([a-f0-9-]{36})/);
    return match ? match[1] : null;
  }

  /**
   * Full bilateral sync - ensures calendar and heat cycles are in sync
   * This handles migration of existing active heat cycles to calendar events
   */
  static async performFullSync(dogId: string, dogName: string): Promise<boolean> {
    try {
      console.log(`🚀 Starting full sync for ${dogName} (${dogId})`);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ No authenticated user for full sync:', authError);
        return false;
      }
      
      // Get all heat cycles for the dog
      const heatCycles = await HeatService.getHeatCycles(dogId);
      const activeHeatCycles = heatCycles.filter(h => !h.end_date);
      const endedHeatCycles = heatCycles.filter(h => h.end_date);
      
      console.log(`📊 Found ${heatCycles.length} total heat cycles for ${dogName}:`, {
        active: activeHeatCycles.length,
        ended: endedHeatCycles.length,
        activeIds: activeHeatCycles.map(h => h.id)
      });
      
      // Check what calendar events already exist
      const { data: existingEvents, error: eventError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', dogId)
        .eq('user_id', user.id)
        .in('type', ['heat', 'heat-active', 'ovulation-predicted', 'fertility-window']);
        
      if (eventError) {
        console.error('❌ Error fetching existing events:', eventError);
      } else {
        console.log(`📅 Found ${existingEvents?.length || 0} existing calendar events:`, 
          existingEvents?.map(e => ({ type: e.type, title: e.title, date: e.date }))
        );
      }
      
      // Clean up ALL existing heat-related calendar events (including predicted ones)
      console.log(`🧹 Cleaning up existing calendar events for ${dogName}...`);
      const cleanupSuccess = await ReminderCalendarSyncService.cleanupSpecificEventTypes(dogId, [
        'heat', 'heat-active', 'ovulation-predicted', 'fertility-window'
      ]);
      
      if (!cleanupSuccess) {
        console.error(`❌ Failed to cleanup existing events for ${dogName}`);
      }

      // Sync each heat cycle to calendar with proper type and status
      let successCount = 0;
      for (const heatCycle of heatCycles) {
        const isActive = !heatCycle.end_date;
        console.log(`⏳ [${successCount + 1}/${heatCycles.length}] Syncing ${isActive ? 'ACTIVE' : 'ended'} heat cycle ${heatCycle.id} for ${dogName}...`);
        
        const success = await this.syncHeatCycleToCalendar(heatCycle, dogName);
        
        if (success) {
          successCount++;
          if (isActive) {
            console.log(`✅ Successfully created ACTIVE heat-active event for ${dogName} (cycle: ${heatCycle.id})`);
            
            // Verify the event was actually created
            const { data: verifyEvent, error: verifyError } = await supabase
              .from('calendar_events')
              .select('*')
              .eq('dog_id', dogId)
              .eq('user_id', user.id)
              .eq('type', 'heat-active')
              .limit(1);
              
            if (verifyError || !verifyEvent?.length) {
              console.error(`❌ VERIFICATION FAILED: heat-active event not found for ${dogName}`, verifyError);
            } else {
              console.log(`✅ VERIFICATION SUCCESS: heat-active event confirmed for ${dogName}`, verifyEvent[0]);
            }
          } else {
            console.log(`✅ Successfully created ended heat event for ${dogName} (cycle: ${heatCycle.id})`);
          }
        } else {
          console.error(`❌ Failed to sync heat cycle ${heatCycle.id} for ${dogName}`);
        }
      }

      console.log(`🎯 Full sync completed for ${dogName}: ${successCount}/${heatCycles.length} cycles synced successfully`);
      
      // Final verification - check for heat-active events
      const { data: finalActiveEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', dogId)
        .eq('user_id', user.id)
        .eq('type', 'heat-active');
        
      console.log(`🔍 Final check: ${finalActiveEvents?.length || 0} heat-active events now exist for ${dogName}`);
      
      return successCount === heatCycles.length;
    } catch (error) {
      console.error('❌ Error in performFullSync:', error);
      return false;
    }
  }
}
