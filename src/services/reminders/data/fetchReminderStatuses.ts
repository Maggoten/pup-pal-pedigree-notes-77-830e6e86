
import { supabase } from "@/integrations/supabase/client";
import type { ReminderStatusData } from "../types";

/**
 * Fetch reminder statuses for the current user
 * @returns Array of reminder status data objects
 */
export const fetchReminderStatuses = async (): Promise<ReminderStatusData[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when fetching reminder statuses');
      return [];
    }
    
    const { data, error } = await supabase
      .from('reminder_status')
      .select('*')
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Error fetching reminder statuses:', error);
      return [];
    }

    return (data || []) as ReminderStatusData[];
  } catch (error) {
    console.error('Unexpected error fetching reminder statuses:', error);
    return [];
  }
};
