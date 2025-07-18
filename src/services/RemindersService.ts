
import { supabase } from '@/integrations/supabase/client';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { v4 as uuidv4 } from 'uuid';
import { loadCustomReminders, loadCompletedReminders, loadDeletedReminders } from '@/utils/reminderStorage';
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

// Add a new reminder to Supabase (works for both custom and system-generated)
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
        user_id: userId,
        source: 'custom'
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

// Improved function to add system-generated reminders with better duplicate detection
export const addSystemReminder = async (reminder: Reminder): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    console.log(`[RemindersService] Attempting to save system reminder: ${reminder.title} for user ${userId}`);
    
    // Validate that we have a proper UUID - system reminders should always have deterministic IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reminder.id)) {
      console.error(`[RemindersService] Invalid UUID for system reminder: ${reminder.id}`);
      return false;
    }
    
    // Enhanced duplicate check - look for exact matches on key fields
    const dueDateStr = reminder.dueDate.toISOString();
    const { data: existingReminders, error: checkError } = await supabase
      .from('reminders')
      .select('id, title, source')
      .eq('user_id', userId)
      .eq('type', reminder.type)
      .eq('related_id', reminder.relatedId || '')
      .eq('due_date', dueDateStr)
      .eq('source', 'system')
      .eq('is_deleted', false)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing reminders:", checkError);
      return false;
    }
    
    // If exact duplicate exists, skip it (safety check)
    if (existingReminders && existingReminders.length > 0) {
      console.log(`[RemindersService] Exact duplicate system reminder found, skipping: ${reminder.title}`);
      return true;
    }
    
    // Insert the new system reminder - the database constraint will prevent duplicates
    const { error } = await supabase
      .from('reminders')
      .insert({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        due_date: dueDateStr,
        priority: reminder.priority,
        type: reminder.type,
        related_id: reminder.relatedId || null,
        user_id: userId,
        source: 'system',
        is_completed: reminder.isCompleted || false,
        is_deleted: false
      });
    
    if (error) {
      // Handle database constraint violations gracefully
      if (error.code === '23505' && error.message.includes('unique_system_reminder')) {
        console.log(`[RemindersService] Database prevented duplicate system reminder: ${reminder.title}`);
        return true; // Return true as this is expected behavior
      }
      console.error("Error adding system reminder:", error);
      return false;
    }
    
    console.log(`[RemindersService] Successfully saved system reminder: ${reminder.title}`);
    return true;
  } catch (error) {
    console.error("Error in addSystemReminder:", error);
    return false;
  }
};

// Update an existing reminder (now works for all reminder types)
export const updateReminder = async (id: string, isCompleted: boolean): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    console.log(`[RemindersService] Updating reminder ${id} to completed: ${isCompleted}`);
    
    const { data, error } = await supabase
      .from('reminders')
      .update({ 
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error("No reminder found to update:", id);
      toast({
        title: "Error",
        description: "Reminder not found. Please refresh and try again.",
        variant: "destructive"
      });
      return false;
    }
    
    console.log(`[RemindersService] Successfully updated reminder ${id}`);
    return true;
  } catch (error) {
    console.error("Error in updateReminder:", error);
    return false;
  }
};

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
        user_id: userId,
        source: 'custom'
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

export const cleanupOldReminders = async (): Promise<void> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      return;
    }
    
    const userId = sessionData.session.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Delete old completed system reminders
    await supabase
      .from('reminders')
      .delete()
      .eq('user_id', userId)
      .eq('source', 'system')
      .eq('is_completed', true)
      .lt('updated_at', thirtyDaysAgo.toISOString());
      
  } catch (error) {
    console.error("Error cleaning up old reminders:", error);
  }
};
