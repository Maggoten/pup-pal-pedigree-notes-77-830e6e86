
import { format, addDays, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { formatDateYYYYMMDD, getNoonDate } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';

export class RemindersService {
  /**
   * Adds a new reminder to the database
   */
  static async addReminder(reminder: CustomReminderInput, userId: string): Promise<string> {
    try {
      // Use the UUID library to generate a unique ID
      const id = uuidv4();
      
      // Format the date as ISO string for storage
      const dueDate = formatDateYYYYMMDD(reminder.dueDate);
      
      // Insert the reminder into the database
      const { error } = await supabase
        .from('reminders')
        .insert({
          id,
          title: reminder.title,
          description: reminder.description,
          due_date: dueDate,
          priority: reminder.priority,
          type: reminder.type,
          related_id: reminder.relatedId || null,
          user_id: userId,
          is_completed: false
        });
        
      if (error) throw error;
      
      return id;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  }
  
  /**
   * Mark a reminder as completed
   */
  static async markComplete(reminderId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)
        .eq('user_id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error marking reminder complete:', error);
      throw error;
    }
  }
  
  /**
   * Delete a reminder by marking it as deleted
   */
  static async deleteReminder(reminderId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_deleted: true })
        .eq('id', reminderId)
        .eq('user_id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
  
  /**
   * Get all reminders for a user
   */
  static async getReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      
      // Transform database format to application format
      const reminders: Reminder[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        dueDate: new Date(item.due_date), // Convert string to Date object
        priority: item.priority as 'high' | 'medium' | 'low',
        type: item.type,
        relatedId: item.related_id,
        isCompleted: item.is_completed,
        isDeleted: item.is_deleted,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      return reminders;
    } catch (error) {
      console.error('Error getting reminders:', error);
      throw error;
    }
  }
}
