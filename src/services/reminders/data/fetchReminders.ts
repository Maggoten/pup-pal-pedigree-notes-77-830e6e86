
import { supabase } from "@/integrations/supabase/client";
import type { ReminderData } from "../types";

/**
 * Fetch all reminders for the current user
 * @returns Array of reminder data objects
 */
export const fetchReminders = async (): Promise<ReminderData[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when fetching reminders');
      return [];
    }
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }

    // Explicitly cast the data to ReminderData[] to ensure type safety
    return (data || []) as ReminderData[];
  } catch (error) {
    console.error('Unexpected error fetching reminders:', error);
    return [];
  }
};
