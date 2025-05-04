
import { supabase } from '@/integrations/supabase/client';
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';

/**
 * Fetch reminders from Supabase for the current user with pagination
 * 
 * @param page - The page number (starting from 1)
 * @param pageSize - The number of items per page
 * @returns Promise with paginated reminders and total count
 */
export const fetchReminders = async (
  page: number = 1, 
  pageSize: number = 10
): Promise<{
  reminders: Reminder[];
  total: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return { reminders: [], total: 0, currentPage: 1, totalPages: 1 };
    }
    
    const userId = sessionData.session.user.id;
    console.log(`Fetching reminders for user: ${userId}, page: ${page}, pageSize: ${pageSize}`);
    
    // Calculate pagination parameters
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // First get the total count of reminders
    const { count, error: countError } = await supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('user_id', userId);
      
    if (countError) {
      console.error("Error counting reminders:", countError);
      return { reminders: [], total: 0, currentPage: 1, totalPages: 1 };
    }
    
    // Calculate total pages
    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    // Now fetch the actual paginated data
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_deleted', false)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .range(from, to);
      
    if (error) {
      console.error("Error fetching reminders:", error);
      return { 
        reminders: [], 
        total: 0, 
        currentPage: page, 
        totalPages: 1 
      };
    }
    
    if (!reminders) return { 
      reminders: [], 
      total: 0, 
      currentPage: page, 
      totalPages: 1 
    };
    
    console.log(`Fetched ${reminders.length} reminders from Supabase (page ${page}/${totalPages})`);
    
    // Transform reminders to match application format
    const transformedReminders = reminders.map(reminder => ({
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

    return {
      reminders: transformedReminders,
      total,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error("Error in fetchReminders:", error);
    return { 
      reminders: [], 
      total: 0, 
      currentPage: page, 
      totalPages: 1 
    };
  }
};
