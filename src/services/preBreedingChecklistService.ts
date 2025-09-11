import { supabase } from '@/integrations/supabase/client';
import { ChecklistGroup, ChecklistItem } from '@/types/checklist';

export interface PreBreedingChecklistItem {
  id: string;
  planned_litter_id: string;
  user_id: string;
  item_id: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Load pre-breeding checklist items from Supabase
 */
export const loadPreBreedingChecklistFromSupabase = async (
  plannedLitterId: string
): Promise<Record<string, boolean>> => {
  const { data, error } = await supabase
    .from('pre_breeding_checklists')
    .select('item_id, completed')
    .eq('planned_litter_id', plannedLitterId);

  if (error) {
    console.error('Error loading pre-breeding checklist from Supabase:', error);
    throw error;
  }

  const statusMap: Record<string, boolean> = {};
  data?.forEach(item => {
    statusMap[item.item_id] = item.completed;
  });

  return statusMap;
};

/**
 * Save pre-breeding checklist item status to Supabase
 */
export const savePreBreedingChecklistItemToSupabase = async (
  plannedLitterId: string,
  itemId: string,
  completed: boolean
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('pre_breeding_checklists')
      .upsert({
        planned_litter_id: plannedLitterId,
        user_id: user.id,
        item_id: itemId,
        completed
      }, {
        onConflict: 'planned_litter_id,item_id'
      });

    if (error) {
      console.error('Error saving pre-breeding checklist item to Supabase:', error);
      // Also save to localStorage as fallback
      saveToLocalStorage(plannedLitterId, itemId, completed);
      return false;
    }

    // Also save to localStorage for offline access
    saveToLocalStorage(plannedLitterId, itemId, completed);
    return true;
  } catch (error) {
    console.error('Error in savePreBreedingChecklistItemToSupabase:', error);
    // Save to localStorage as fallback
    saveToLocalStorage(plannedLitterId, itemId, completed);
    return false;
  }
};

/**
 * Apply Supabase statuses to checklist items
 */
export const applySupabaseStatuses = (
  checklistGroups: ChecklistGroup[],
  statuses: Record<string, boolean>
): ChecklistGroup[] => {
  return checklistGroups.map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      isCompleted: statuses[item.id] ?? item.isCompleted
    }))
  }));
};

/**
 * Apply localStorage statuses to checklist items (fallback)
 */
export const applyStoredStatuses = (
  checklistGroups: ChecklistGroup[],
  plannedLitterId: string
): ChecklistGroup[] => {
  const storedStatuses = getFromLocalStorage(plannedLitterId);
  
  return checklistGroups.map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      isCompleted: storedStatuses[item.id] ?? item.isCompleted
    }))
  }));
};

/**
 * Save to localStorage (fallback/offline storage)
 */
const saveToLocalStorage = (
  plannedLitterId: string,
  itemId: string,
  completed: boolean
) => {
  try {
    const key = `preBreeding_checklist_items_${plannedLitterId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[itemId] = completed;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get from localStorage (fallback/offline storage)
 */
const getFromLocalStorage = (plannedLitterId: string): Record<string, boolean> => {
  try {
    const key = `preBreeding_checklist_items_${plannedLitterId}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return {};
  }
};