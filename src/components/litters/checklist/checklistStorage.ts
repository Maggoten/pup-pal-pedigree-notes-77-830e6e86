
import { ChecklistItem } from './types';
import { supabaseLitterService } from '@/services/supabase/litterService';

/**
 * Loads checklist status from Supabase
 */
export const loadChecklistStatus = async (litterId: string): Promise<Record<string, boolean>> => {
  try {
    // Load from Supabase
    const storedStatuses = await supabaseLitterService.loadChecklistStatuses(litterId);
    return storedStatuses;
  } catch (error) {
    console.error('Error loading checklist statuses:', error);
    return {};
  }
};

/**
 * Saves checklist item status to Supabase
 */
export const saveChecklistItemStatus = async (
  litterId: string, 
  itemId: string, 
  completed: boolean
): Promise<void> => {
  try {
    await supabaseLitterService.saveChecklistItemStatus(litterId, itemId, completed);
  } catch (error) {
    console.error('Error saving checklist item status:', error);
  }
};

/**
 * Applies saved completion statuses to checklist items
 */
export const applyStoredStatuses = (
  items: ChecklistItem[], 
  savedStatuses: Record<string, boolean>
): ChecklistItem[] => {
  return items.map(item => ({
    ...item,
    isCompleted: savedStatuses[item.id] ?? item.isCompleted
  }));
};
