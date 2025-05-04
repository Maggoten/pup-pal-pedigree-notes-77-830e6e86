
import { supabase } from '@/integrations/supabase/client';
import { loadCustomReminders, loadCompletedReminders, loadDeletedReminders } from '@/utils/reminderStorage';

/**
 * Migrate reminders from localStorage to Supabase (one-time operation)
 */
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
