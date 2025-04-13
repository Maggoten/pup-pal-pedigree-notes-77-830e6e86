
import { supabase } from "@/integrations/supabase/client";
import { Reminder, CustomReminderInput } from "@/types/reminders";
import { createCalendarClockIcon } from "@/utils/iconUtils";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

// Type for the reminder data stored in Supabase
export interface ReminderData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  dog_id?: string;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

// Type for the reminder status data stored in Supabase
export interface ReminderStatusData {
  id: string;
  user_id: string;
  reminder_id: string;
  is_completed: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

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

// Add a custom reminder
export const addCustomReminder = async (input: CustomReminderInput): Promise<string | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when adding reminder');
      return null;
    }
    
    const id = `custom-${uuidv4()}`;
    
    const { error } = await supabase
      .from('reminders')
      .insert({
        id,
        user_id: userData.user.id,
        title: input.title,
        description: input.description,
        due_date: input.dueDate.toISOString(),
        priority: input.priority,
        type: 'custom',
        is_custom: true
      });

    if (error) {
      console.error('Error adding custom reminder:', error);
      return null;
    }

    return id;
  } catch (error) {
    console.error('Unexpected error adding custom reminder:', error);
    return null;
  }
};

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

// Add or update reminder status
export const updateReminderStatus = async (
  reminderId: string, 
  isCompleted: boolean, 
  isDeleted: boolean = false
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when updating reminder status');
      return false;
    }
    
    // First check if a status record already exists
    const { data: existingStatus } = await supabase
      .from('reminder_status')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('reminder_id', reminderId)
      .single();
    
    if (existingStatus) {
      // Update existing status
      const { error } = await supabase
        .from('reminder_status')
        .update({
          is_completed: isCompleted,
          is_deleted: isDeleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStatus.id);
      
      if (error) {
        console.error('Error updating reminder status:', error);
        return false;
      }
    } else {
      // Insert new status
      const { error } = await supabase
        .from('reminder_status')
        .insert({
          user_id: userData.user.id,
          reminder_id: reminderId,
          is_completed: isCompleted,
          is_deleted: isDeleted
        });
      
      if (error) {
        console.error('Error creating reminder status:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating reminder status:', error);
    return false;
  }
};

// Delete a reminder (for custom reminders)
export const deleteReminder = async (reminderId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when deleting reminder');
      return false;
    }
    
    // For custom reminders, actually delete the record
    if (reminderId.startsWith('custom-')) {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', userData.user.id);
      
      if (error) {
        console.error('Error deleting custom reminder:', error);
        return false;
      }
      
      // Also remove any status records
      await supabase
        .from('reminder_status')
        .delete()
        .eq('reminder_id', reminderId);
        
      return true;
    } else {
      // For system reminders, just mark as deleted in the status table
      return await updateReminderStatus(reminderId, false, true);
    }
  } catch (error) {
    console.error('Unexpected error deleting reminder:', error);
    return false;
  }
};

// Map a reminder from Supabase to the application's Reminder type
export const mapToReminder = (data: ReminderData, isCompleted: boolean = false): Reminder => {
  // Ensure the type is one of the allowed values in Reminder.type
  const safeType = data.type as Reminder['type'];
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    dueDate: new Date(data.due_date),
    priority: data.priority,
    type: safeType,
    relatedId: data.dog_id,
    isCompleted,
    icon: createIconForReminder(data.type, data.priority)
  };
};

// Helper to create appropriate icon based on reminder type and priority
const createIconForReminder = (type: string, priority: 'high' | 'medium' | 'low') => {
  // You can expand this to handle all reminder types from your existing code
  const color = priority === 'high' ? 'rose-500' : 
               priority === 'medium' ? 'amber-500' : 'green-500';
  
  return createCalendarClockIcon(color);
};

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
