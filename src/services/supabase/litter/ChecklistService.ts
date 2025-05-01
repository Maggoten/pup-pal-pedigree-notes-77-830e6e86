
import { supabase } from '@/integrations/supabase/client';
import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { ChecklistService as IChecklistService } from './types';

/**
 * Service responsible for puppy development checklist operations
 */
export class ChecklistService extends BaseSupabaseService implements IChecklistService {
  /**
   * Save checklist item status
   */
  async saveChecklistItemStatus(litterId: string, itemId: string, completed: boolean): Promise<boolean> {
    try {
      // First check if the item exists
      const { data: existingItem, error: checkError } = await supabase
        .from('development_checklist_items')
        .select('*')
        .eq('litter_id', litterId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing checklist item:', checkError);
        return false;
      }

      if (existingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('development_checklist_items')
          .update({ completed })
          .eq('litter_id', litterId)
          .eq('item_id', itemId);

        if (updateError) {
          console.error('Error updating checklist item:', updateError);
          return false;
        }
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('development_checklist_items')
          .insert({
            litter_id: litterId,
            item_id: itemId,
            completed
          });

        if (insertError) {
          console.error('Error inserting checklist item:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in saveChecklistItemStatus:', error);
      return false;
    }
  }

  /**
   * Load checklist item statuses for a litter
   */
  async loadChecklistStatuses(litterId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('development_checklist_items')
        .select('item_id, completed')
        .eq('litter_id', litterId);

      if (error) {
        console.error('Error loading checklist statuses:', error);
        return {};
      }

      // Convert array to object map
      const statusMap: Record<string, boolean> = {};
      data.forEach(item => {
        statusMap[item.item_id] = item.completed;
      });

      return statusMap;
    } catch (error) {
      console.error('Error in loadChecklistStatuses:', error);
      return {};
    }
  }
}
