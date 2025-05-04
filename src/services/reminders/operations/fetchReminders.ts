
import { supabase } from '@/integrations/supabase/client';
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';

/**
 * Fetch reminders from Supabase for the current user
 */
export const fetchReminders = async (): Promise<Reminder[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return [];
    }
    
    const userId = sessionData.session.user.id;
    console.log("Fetching reminders for user:", userId);
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_deleted', false)
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
      
    if (error) {
      console.error("Error fetching reminders:", error);
      return [];
    }
    
    if (!reminders) return [];
    
    console.log("Fetched reminders from Supabase:", reminders.length);
    
    // Transform reminders to match application format
    return reminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      dueDate: new Date(reminder.due_date),
      priority: reminder.priority as 'high' | 'medium' | 'low',
      type: reminder.type as any,
      relatedId: reminder.related_id,
      isCompleted: reminder.is_completed,
      // Generate the icon based on priority
      icon: createCalendarClockIcon(
        reminder.priority === 'high' ? 'rose-500' : 
        reminder.priority === 'medium' ? 'amber-500' : 'green-500'
      )
    }));
  } catch (error) {
    console.error("Error in fetchReminders:", error);
    return [];
  }
};
