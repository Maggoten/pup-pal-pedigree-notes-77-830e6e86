
import { supabase } from "@/integrations/supabase/client";

// Add or update reminder status
export const updateReminderStatus = async (
  reminderId: string, 
  isCompleted: boolean, 
  isDeleted: boolean = false
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when updating reminder status');
      return false;
    }
    
    // First check if a status record already exists
    const { data: existingStatus } = await supabase
      .from('reminder_status')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('reminder_id', reminderId)
      .single();
    
    if (existingStatus) {
      // Update existing status
      const { error } = await supabase
        .from('reminder_status')
        .update({
          is_completed: isCompleted,
          is_deleted: isDeleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStatus.id);
      
      if (error) {
        console.error('Error updating reminder status:', error);
        return false;
      }
    } else {
      // Insert new status
      const { error } = await supabase
        .from('reminder_status')
        .insert({
          user_id: userData.user.id,
          reminder_id: reminderId,
          is_completed: isCompleted,
          is_deleted: isDeleted
        });
      
      if (error) {
        console.error('Error creating reminder status:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating reminder status:', error);
    return false;
  }
};
