
import { supabase } from '@/integrations/supabase/client';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { toast } from '@/components/ui/use-toast';

// Fetch reminders from Supabase
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
      .eq('user_id', userId)  // Make sure to filter by user_id
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
      type: reminder.type as string,
      related_id: reminder.related_id,
      is_completed: reminder.is_completed,
      // For backward compatibility
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

// Add a new reminder to Supabase
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

// Update an existing reminder (including mark as complete/incomplete)
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

// Delete (soft delete) a reminder
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
        .eq('user_id', userId);  // Make sure we're only deleting the user's own reminders
        
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
        .eq('user_id', userId);  // Make sure we're only updating the user's own reminders
        
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

// Migrate reminders from localStorage to Supabase (one-time operation)
export const migrateRemindersFromLocalStorage = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session for migration:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Get data from local storage
    const customReminders = loadCustomReminders();
    const completedReminderIds = loadCompletedReminders();
    const deletedReminderIds = loadDeletedReminders();
    
    if (customReminders.length === 0 && 
        completedReminderIds.size === 0 && 
        deletedReminderIds.size === 0) {
      // No local data to migrate
      return true;
    }
    
    console.log("Starting reminders migration...");
    
    // Migrate custom reminders
    if (customReminders.length > 0) {
      const reminderInserts = customReminders.map(reminder => ({
        title: reminder.title,
        description: reminder.description,
        due_date: reminder.dueDate.toISOString(),
        priority: reminder.priority,
        type: reminder.type,
        related_id: reminder.relatedId,
        is_completed: completedReminderIds.has(reminder.id),
        user_id: userId
      }));
      
      const { error } = await supabase
        .from('reminders')
        .insert(reminderInserts);
        
      if (error) {
        console.error("Error migrating custom reminders:", error);
        return false;
      }
    }
    
    console.log("Migration completed successfully");
    
    // Clear local storage after successful migration
    localStorage.removeItem('customReminders');
    localStorage.removeItem('completedReminders');
    localStorage.removeItem('deletedReminderIds');
    
    return true;
  } catch (error) {
    console.error("Error in migrateRemindersFromLocalStorage:", error);
    return false;
  }
};
