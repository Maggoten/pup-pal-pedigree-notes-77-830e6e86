
import { Litter } from '@/types/breeding';
import { ChecklistItem } from './types';
import { generateChecklistItems } from './checklistData';
import { 
  applyStoredStatuses, 
  saveChecklistItemStatusToSupabase, 
  loadChecklistStatusFromSupabase,
  applySupabaseStatuses 
} from './checklistStorage';

/**
 * Generates a complete checklist for a litter with saved completion statuses applied
 */
export const generateChecklist = async (litter: Litter): Promise<ChecklistItem[]> => {
  // Generate the base checklist items
  const checklistItems = generateChecklistItems(litter.id);
  
  try {
    // Try to load from Supabase first
    const supabaseStatuses = await loadChecklistStatusFromSupabase(litter.id);
    
    // If we have Supabase data, use it
    if (Object.keys(supabaseStatuses).length > 0) {
      return applySupabaseStatuses(checklistItems, supabaseStatuses);
    }
    
    // Fall back to localStorage
    return applyStoredStatuses(checklistItems, litter.id);
  } catch (error) {
    console.error('Error loading checklist from Supabase, falling back to localStorage:', error);
    // Apply localStorage statuses as fallback
    return applyStoredStatuses(checklistItems, litter.id);
  }
};

/**
 * Saves checklist item status to both Supabase and localStorage
 */
export const saveChecklistItemStatus = async (
  litterId: string, 
  itemId: string, 
  completed: boolean
): Promise<boolean> => {
  return await saveChecklistItemStatusToSupabase(litterId, itemId, completed);
};
