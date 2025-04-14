
import { supabase } from "@/integrations/supabase/client";
import { Reminder } from "@/types/reminders";

// Migrate local reminders to Supabase (used for one-time migration)
export const migrateLocalRemindersToSupabase = async (
  customReminders: Reminder[],
  completedReminders: Set<string>,
  deletedReminders: Set<string>
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found for migration');
      return false;
    }
    
    // Migrate custom reminders
    for (const reminder of customReminders) {
      const insertPromise = supabase
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
          is_custom: true
        });
      
      await insertPromise.then(({ error }) => {
        if (error && error.code !== '23505') { // Ignore duplicate key violations
          console.error(`Error migrating custom reminder ${reminder.id}:`, error);
        }
      });
    }
    
    // Migrate completed and deleted statuses
    const statusPromises: Promise<void>[] = [];
    
    completedReminders.forEach(reminderId => {
      const insertPromise = supabase
        .from('reminder_status')
        .insert({
          user_id: userData.user.id,
          reminder_id: reminderId,
          is_completed: true,
          is_deleted: deletedReminders.has(reminderId)
        });
      
      statusPromises.push(
        insertPromise.then(({ error }) => {
          if (error && error.code !== '23505') { // Ignore duplicate key violations
            console.error(`Error migrating status for ${reminderId}:`, error);
          }
        }) as Promise<void>
      );
    });
    
    // For deleted reminders that aren't completed
    deletedReminders.forEach(reminderId => {
      if (!completedReminders.has(reminderId)) {
        const insertPromise = supabase
          .from('reminder_status')
          .insert({
            user_id: userData.user.id,
            reminder_id: reminderId,
            is_completed: false,
            is_deleted: true
          });
        
        statusPromises.push(
          insertPromise.then(({ error }) => {
            if (error && error.code !== '23505') { // Ignore duplicate key violations
              console.error(`Error migrating deleted status for ${reminderId}:`, error);
            }
          }) as Promise<void>
        );
      }
    });
    
    await Promise.all(statusPromises);
    return true;
  } catch (error) {
    console.error('Unexpected error during migration:', error);
    return false;
  }
};
