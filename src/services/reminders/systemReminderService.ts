
import { supabase } from "@/integrations/supabase/client";
import { Reminder } from "@/types/reminders";

// Add a system-generated reminder
export const addSystemReminder = async (reminder: Omit<Reminder, 'icon'>): Promise<string | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when adding system reminder');
      return null;
    }
    
    const { error } = await supabase
      .from('reminders')
      .insert({
        id: reminder.id,
        user_id: userData.user.id,
        title: reminder.title,
        description: reminder.description,
        due_date: reminder.dueDate.toISOString(),
        priority: reminder.priority,
        type: reminder.type,
        dog_id: reminder.relatedId,
        is_custom: false
      });

    if (error) {
      console.error('Error adding system reminder:', error);
      return null;
    }

    return reminder.id;
  } catch (error) {
    console.error('Unexpected error adding system reminder:', error);
    return null;
  }
};
