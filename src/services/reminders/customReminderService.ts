
import { supabase } from "@/integrations/supabase/client";
import { CustomReminderInput } from "@/types/reminders";
import { v4 as uuidv4 } from "uuid";
import { updateReminderStatus } from "./reminderStatusService";

// Add a custom reminder
export const addCustomReminder = async (input: CustomReminderInput): Promise<string | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when adding reminder');
      return null;
    }
    
    const id = `custom-${uuidv4()}`;
    
    const { error } = await supabase
      .from('reminders')
      .insert({
        id,
        user_id: userData.user.id,
        title: input.title,
        description: input.description,
        due_date: input.dueDate.toISOString(),
        priority: input.priority,
        type: 'custom',
        is_custom: true
      });

    if (error) {
      console.error('Error adding custom reminder:', error);
      return null;
    }

    return id;
  } catch (error) {
    console.error('Unexpected error adding custom reminder:', error);
    return null;
  }
};

// Delete a reminder (for custom reminders)
export const deleteReminder = async (reminderId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when deleting reminder');
      return false;
    }
    
    // For custom reminders, actually delete the record
    if (reminderId.startsWith('custom-')) {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', userData.user.id);
      
      if (error) {
        console.error('Error deleting custom reminder:', error);
        return false;
      }
      
      // Also remove any status records
      await supabase
        .from('reminder_status')
        .delete()
        .eq('reminder_id', reminderId);
        
      return true;
    } else {
      // For system reminders, just mark as deleted in the status table
      return await updateReminderStatus(reminderId, false, true);
    }
  } catch (error) {
    console.error('Unexpected error deleting reminder:', error);
    return false;
  }
};
