
import { Litter } from '@/types/breeding';
import { ChecklistItem } from './types';
import { generateChecklistItems } from './checklistData';
import { loadChecklistStatus } from './checklistStorage';

/**
 * Generates a complete checklist for a litter with saved completion statuses applied
 */
export const generateChecklist = async (litter: Litter): Promise<ChecklistItem[]> => {
  // Generate the base checklist items
  const checklistItems = generateChecklistItems(litter.id);
  
  // Apply any saved completion statuses from Supabase
  const savedStatuses = await loadChecklistStatus(litter.id);
  
  return checklistItems.map(item => ({
    ...item,
    isCompleted: savedStatuses[item.id] ?? item.isCompleted
  }));
};

// Re-export the storage function to maintain the same public API
export { saveChecklistItemStatus } from './checklistStorage';
