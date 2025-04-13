
import { supabase } from "@/integrations/supabase/client";
import { ReminderData, ReminderStatusData } from "./types";

// Fetch all reminders for the current user
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

// Fetch reminder statuses for the current user
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
