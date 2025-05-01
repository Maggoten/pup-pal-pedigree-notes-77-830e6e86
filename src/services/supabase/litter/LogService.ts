
import { supabase } from '@/integrations/supabase/client';
import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { LogService as ILogService } from './types';

/**
 * Service responsible for handling puppy logs (weight, height, notes)
 */
export class LogService extends BaseSupabaseService implements ILogService {
  /**
   * Add a weight log entry for a puppy
   */
  async addWeightLog(puppyId: string, date: string, weight: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppy_weight_logs')
        .insert({
          puppy_id: puppyId,
          date,
          weight
        });

      if (error) {
        console.error('Error adding weight log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addWeightLog:', error);
      return false;
    }
  }

  /**
   * Add a height log entry for a puppy
   */
  async addHeightLog(puppyId: string, date: string, height: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppy_height_logs')
        .insert({
          puppy_id: puppyId,
          date,
          height
        });

      if (error) {
        console.error('Error adding height log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addHeightLog:', error);
      return false;
    }
  }

  /**
   * Add a note for a puppy
   */
  async addPuppyNote(puppyId: string, date: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppy_notes')
        .insert({
          puppy_id: puppyId,
          date,
          content
        });

      if (error) {
        console.error('Error adding puppy note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addPuppyNote:', error);
      return false;
    }
  }
}
