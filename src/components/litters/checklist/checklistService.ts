
import { Litter } from '@/types/breeding';
import { ChecklistItem } from './types';
import { generateChecklistItems } from './checklistData';
import { applyStoredStatuses, saveChecklistItemStatus } from './checklistStorage';

/**
 * Generates a complete checklist for a litter with saved completion statuses applied
 */
export const generateChecklist = (litter: Litter): ChecklistItem[] => {
  // Generate the base checklist items
  const checklistItems = generateChecklistItems(litter.id);
  
  // Apply any saved completion statuses from localStorage
  return applyStoredStatuses(checklistItems, litter.id);
};

// Re-export the storage function to maintain the same public API
export { saveChecklistItemStatus };
