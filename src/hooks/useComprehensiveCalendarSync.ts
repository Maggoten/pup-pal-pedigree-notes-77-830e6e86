import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';
import { useDogs } from '@/context/DogsContext';
import { useToast } from '@/hooks/use-toast';

export const useComprehensiveCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { dogs } = useDogs();
  const { toast } = useToast();

  const syncCalendar = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      console.log('[CalendarSync] Starting comprehensive calendar sync');

      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('[CalendarSync] No authenticated user:', authError);
        toast({
          title: "Sync Failed",
          description: "Please log in to sync calendar events.",
          variant: "destructive"
        });
        return false;
      }

      const userId = authData.user.id;

      // Step 1: Delete ALL calendar events for this user
      console.log('[CalendarSync] Deleting all existing calendar events for user');
      const { data: existingEvents, error: fetchError } = await supabase
        .from('calendar_events')
        .select('id, title, type')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('[CalendarSync] Error fetching existing events:', fetchError);
        throw new Error('Failed to fetch existing events');
      }

      const eventCount = existingEvents?.length || 0;
      console.log(`[CalendarSync] Found ${eventCount} existing events to delete`);

      if (eventCount > 0) {
        const { error: deleteError } = await supabase
          .from('calendar_events')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('[CalendarSync] Error deleting events:', deleteError);
          throw new Error('Failed to delete existing events');
        }
        
        console.log(`[CalendarSync] Successfully deleted ${eventCount} calendar events`);
      }

      // Step 2: Regenerate all calendar events from current dog data
      console.log('[CalendarSync] Regenerating calendar events from dog data');
      console.log(`[CalendarSync] Processing ${dogs.length} dogs`);

      const syncSuccess = await ReminderCalendarSyncService.bulkSyncCalendarEvents(dogs);
      
      if (!syncSuccess) {
        throw new Error('Failed to regenerate calendar events');
      }

      // Step 3: Verify new events were created
      const { data: newEvents, error: verifyError } = await supabase
        .from('calendar_events')
        .select('id, title, type')
        .eq('user_id', userId);

      if (verifyError) {
        console.error('[CalendarSync] Error verifying new events:', verifyError);
      }

      const newEventCount = newEvents?.length || 0;
      console.log(`[CalendarSync] Successfully created ${newEventCount} new calendar events`);

      // Success notification
      toast({
        title: "Calendar Synced",
        description: `Removed ${eventCount} old events and created ${newEventCount} new events based on your current dog data.`,
      });

      return true;

    } catch (error) {
      console.error('[CalendarSync] Comprehensive sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync calendar events. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncCalendar,
    isSyncing
  };
};