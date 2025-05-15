
import { supabase } from '@/integrations/supabase/client';
import { UpcomingHeat, Reminder } from '@/types/reminders';
import { Dog } from '@/types/dogs';
import { addDays, format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { safeFilter } from '@/utils/supabaseTypeUtils';

// Structure for calendar event
interface CalendarEvent {
  id?: string;
  title: string;
  date: string | Date; // Can be either string or Date - will convert to string when sending to Supabase
  time?: string;
  type: string;
  dog_id?: string;
  dog_name?: string;
  notes?: string;
  user_id?: string;
}

/**
 * Converts a Date object to an ISO string for Supabase
 */
const formatDateForSupabase = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
};

/**
 * Service for synchronizing reminders with calendar events
 */
export class ReminderCalendarSyncService {
  /**
   * Add or update a calendar event for a reminder
   * @param reminder The reminder to sync
   * @returns boolean indicating success
   */
  static async syncReminderEvent(reminder: Reminder): Promise<boolean> {
    try {
      if (!reminder.id) {
        console.warn('Cannot sync reminder without ID');
        return false;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return false;
      }
      
      // Check if a calendar event already exists for this reminder
      const { data: existingEvents } = await safeFilter(
        supabase.from('calendar_events').select('*'),
        'notes',
        `reminder_id:${reminder.id}`
      );
      
      const event: CalendarEvent = {
        title: reminder.title,
        date: formatDateForSupabase(reminder.dueDate),
        type: reminder.type || 'reminder',
        notes: `reminder_id:${reminder.id}\n${reminder.description || ''}`,
        user_id: user.id
      };
      
      if (reminder.related_id && reminder.related_id.startsWith('dog:')) {
        const dogId = reminder.related_id.replace('dog:', '');
        event.dog_id = dogId;
        
        // Fetch dog name
        try {
          const { data: dog } = await safeFilter(
            supabase.from('dogs').select('name'),
            'id',
            dogId
          ).single();
          
          if (dog) {
            event.dog_name = dog.name;
          }
        } catch (error) {
          console.warn('Failed to get dog name:', error);
        }
      }
      
      // If event exists, update it; otherwise create a new one
      if (existingEvents && existingEvents.length > 0) {
        const { error } = await safeFilter(
          supabase.from('calendar_events').update(event),
          'id',
          existingEvents[0].id
        );
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from('calendar_events').insert(event);
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing reminder event:', error);
      return false;
    }
  }
  
  /**
   * Remove calendar events associated with a reminder
   * @param reminderId The ID of the reminder
   * @returns boolean indicating success
   */
  static async removeReminderEvents(reminderId: string): Promise<boolean> {
    try {
      if (!reminderId) return false;
      
      // Delete all calendar events for this reminder
      const { error } = await safeFilter(
        supabase.from('calendar_events').delete(),
        'notes',
        `reminder_id:${reminderId}`
      );
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error removing reminder events:', error);
      return false;
    }
  }
  
  /**
   * Handle a reminder being marked as complete
   * @param reminderId The ID of the reminder
   * @param removeEvent Whether to remove the event (default: false)
   * @returns boolean indicating success
   */
  static async handleReminderCompletion(reminderId: string, removeEvent: boolean = false): Promise<boolean> {
    try {
      if (removeEvent) {
        return await this.removeReminderEvents(reminderId);
      } else {
        // Get the reminder event
        const { data: events } = await safeFilter(
          supabase.from('calendar_events').select('*'),
          'notes',
          `reminder_id:${reminderId}`
        );
        
        if (events && events.length > 0) {
          // Update the event title to indicate completion
          const { error } = await safeFilter(
            supabase.from('calendar_events').update({ title: `✓ ${events[0].title}` }),
            'id',
            events[0].id
          );
          
          if (error) throw error;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error handling reminder completion:', error);
      return false;
    }
  }
  
  /**
   * Create heat cycle reminders and events
   * @param heat The upcoming heat data
   * @returns boolean indicating success
   */
  static async syncHeatCycleEvents(heat: UpcomingHeat): Promise<boolean> {
    try {
      // Make sure dog exists and has expected dates
      if (!heat.dog || !heat.expectedDate) {
        console.warn('Cannot sync heat cycle without dog or expected date');
        return false;
      }
      
      const dog = heat.dog;
      const expectedDate = heat.expectedDate;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return false;
      }
      
      // Create the main heat cycle event
      const dogId = dog.id;
      const dogName = dog.name;
      const preHeatDate = expectedDate;
      
      const preHeatEvent: CalendarEvent = {
        title: `${dogName} - Starting heat cycle`,
        date: formatDateForSupabase(preHeatDate),
        type: 'heat',
        dog_id: dogId,
        dog_name: dogName,
        notes: `Heat cycle begins for ${dogName}`,
        user_id: user.id
      };
      
      // Check if the event already exists
      const { data: existingEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', dogId)
        .eq('type', 'heat')
        .gte('date', format(addDays(preHeatDate, -7), 'yyyy-MM-dd'))
        .lte('date', format(addDays(preHeatDate, 7), 'yyyy-MM-dd'));
      
      // If event exists, update it; otherwise create a new one
      if (existingEvents && existingEvents.length > 0) {
        const { error } = await safeFilter(
          supabase.from('calendar_events').update(preHeatEvent),
          'id',
          existingEvents[0].id
        );
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from('calendar_events').insert(preHeatEvent);
        if (error) throw error;
      }
      
      // Create fertility window event (typically 9-15 days after start)
      const fertilityStartDate = addDays(preHeatDate, 9);
      
      const fertilityEvent: CalendarEvent = {
        title: `${dogName} - Fertility window begins`,
        date: formatDateForSupabase(fertilityStartDate),
        type: 'heat',
        dog_id: dogId,
        dog_name: dogName,
        notes: `Fertility window begins for ${dogName}`,
        user_id: user.id
      };
      
      // Check if the fertility event already exists
      const { data: existingFertilityEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('dog_id', dogId)
        .eq('type', 'heat')
        .like('title', `%Fertility window%`)
        .gte('date', format(addDays(fertilityStartDate, -3), 'yyyy-MM-dd'))
        .lte('date', format(addDays(fertilityStartDate, 3), 'yyyy-MM-dd'));
      
      // If event exists, update it; otherwise create a new one
      if (existingFertilityEvents && existingFertilityEvents.length > 0) {
        const { error } = await safeFilter(
          supabase.from('calendar_events').update(fertilityEvent),
          'id',
          existingFertilityEvents[0].id
        );
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from('calendar_events').insert(fertilityEvent);
        if (error) throw error;
      }
      
      // Success
      return true;
    } catch (error) {
      console.error('Error syncing heat cycle events:', error);
      
      // Show toast to user
      toast({
        title: "Error",
        description: "Failed to sync heat cycle events to calendar",
        variant: "destructive"
      });
      
      return false;
    }
  }
}
