
import { supabase } from '@/integrations/supabase/client';
import { CustomReminderInput } from '@/types/reminders';
import { toast } from '@/components/ui/use-toast';

/**
 * Add a new reminder to Supabase
 */
export const addReminder = async (input: CustomReminderInput): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    const { error } = await supabase
      .from('reminders')
      .insert({
        title: input.title,
        description: input.description,
        due_date: input.dueDate.toISOString(),
        priority: input.priority,
        type: 'custom',
        user_id: userId
      });
    
    if (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Reminder added successfully."
    });
    
    return true;
  } catch (error) {
    console.error("Error in addReminder:", error);
    return false;
  }
};
