
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { formatDateYYYYMMDD, getNoonDate } from '@/utils/dateUtils';

interface DbReminder {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  type: string;
  related_id?: string | null;
  is_completed: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export class RemindersService {
  /**
   * Fetches all reminders for a user
   */
  static async fetchReminders(userId: string): Promise<Reminder[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching reminders:', error);
        return [];
      }

      return this.mapDbRemindersToReminders(data || []);
    } catch (error) {
      console.error('Unexpected error fetching reminders:', error);
      return [];
    }
  }

  /**
   * Adds a custom reminder for a user
   */
  static async addReminder(
    userId: string,
    reminderInput: CustomReminderInput
  ): Promise<Reminder | null> {
    if (!userId) return null;

    try {
      const formattedDate = reminderInput.dueDate instanceof Date 
        ? formatDateYYYYMMDD(reminderInput.dueDate)
        : formatDateYYYYMMDD(new Date(reminderInput.dueDate));

      const newReminder: DbReminder = {
        id: uuidv4(),
        title: reminderInput.title,
        description: reminderInput.description,
        due_date: formattedDate,
        priority: reminderInput.priority,
        type: reminderInput.type || 'custom',
        related_id: reminderInput.relatedId || null,
        is_completed: false,
        is_deleted: false,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from('reminders')
        .insert([newReminder])
        .select()
        .single();

      if (error) {
        console.error('Error adding reminder:', error);
        return null;
      }

      return this.mapDbReminderToReminder(data);
    } catch (error) {
      console.error('Unexpected error adding reminder:', error);
      return null;
    }
  }

  /**
   * Marks a reminder as complete
   */
  static async markReminderComplete(
    userId: string,
    reminderId: string
  ): Promise<boolean> {
    if (!userId || !reminderId) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking reminder complete:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error marking reminder complete:', error);
      return false;
    }
  }

  /**
   * Deletes a reminder
   */
  static async deleteReminder(
    userId: string,
    reminderId: string
  ): Promise<boolean> {
    if (!userId || !reminderId) return false;

    try {
      // Soft delete by setting is_deleted to true
      const { error } = await supabase
        .from('reminders')
        .update({ is_deleted: true })
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting reminder:', error);
      return false;
    }
  }

  /**
   * Maps DB reminder format to application Reminder format
   */
  private static mapDbReminderToReminder(dbReminder: DbReminder): Reminder {
    return {
      id: dbReminder.id,
      title: dbReminder.title,
      description: dbReminder.description,
      dueDate: dbReminder.due_date,
      priority: dbReminder.priority as 'high' | 'medium' | 'low',
      type: dbReminder.type,
      relatedId: dbReminder.related_id,
      isCompleted: dbReminder.is_completed,
      isDeleted: dbReminder.is_deleted,
      createdAt: dbReminder.created_at,
      updatedAt: dbReminder.updated_at,
    };
  }

  /**
   * Maps an array of DB reminders to application Reminders
   */
  private static mapDbRemindersToReminders(dbReminders: DbReminder[]): Reminder[] {
    return dbReminders.map(this.mapDbReminderToReminder);
  }

  /**
   * Creates an ISO date string for storage
   */
  private static dateToStorageFormat(date: Date | string): string {
    if (date instanceof Date) {
      return formatDateYYYYMMDD(date);
    }
    return date;
  }
}
