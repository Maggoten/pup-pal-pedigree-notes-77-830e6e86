
import { supabase } from '@/integrations/supabase/client';
import { Reminder } from '@/types/reminders';

/**
 * Update a reminder's completion status.
 * @param id - The ID of the reminder to update
 * @param isCompleted - Boolean indicating whether the reminder is completed
 */
export const updateReminder = async (id: string, isCompleted: boolean): Promise<void> => {
  try {
    console.log(`[REMINDERS_SERVICE] Updating reminder ${id} to completed: ${isCompleted}`);
    
    const { error } = await supabase
      .from('reminders')
      .update({ 
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', id);
    
    if (error) {
      console.error('[REMINDERS_SERVICE] Error updating reminder:', error);
      throw new Error(`Failed to update reminder: ${error.message}`);
    }
    
    console.log(`[REMINDERS_SERVICE] Successfully updated reminder ${id}`);
  } catch (error) {
    console.error(`[REMINDERS_SERVICE] Error in updateReminder:`, error);
    throw error;
  }
};
