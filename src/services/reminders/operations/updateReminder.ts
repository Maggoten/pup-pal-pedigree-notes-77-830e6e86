
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Update an existing reminder (including mark as complete/incomplete)
 */
export const updateReminder = async (id: string, isCompleted: boolean): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    const { error } = await supabase
      .from('reminders')
      .update({ 
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);  // Make sure we're only updating the user's own reminders
    
    if (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateReminder:", error);
    return false;
  }
};
