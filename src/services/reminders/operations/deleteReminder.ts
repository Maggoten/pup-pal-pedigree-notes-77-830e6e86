
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Delete (soft delete) a reminder
 */
export const deleteReminder = async (id: string): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // For custom reminders with UUID format, perform a hard delete
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error deleting reminder:", error);
        toast({
          title: "Error",
          description: "Failed to delete reminder. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } else {
      // For system-generated reminders, do a soft delete
      const { error } = await supabase
        .from('reminders')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error soft-deleting reminder:", error);
        toast({
          title: "Error",
          description: "Failed to delete reminder. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteReminder:", error);
    return false;
  }
};
