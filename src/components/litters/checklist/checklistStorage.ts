
import { ChecklistItem } from './types';

// Storage key prefix for checklist data
const STORAGE_KEY_PREFIX = 'litter-checklist-';

/**
 * Loads checklist status from localStorage
 */
export const loadChecklistStatus = (litterId: string): Record<string, boolean> => {
  const savedStatus = localStorage.getItem(`${STORAGE_KEY_PREFIX}${litterId}`);
  if (savedStatus) {
    try {
      return JSON.parse(savedStatus);
    } catch (e) {
      console.error('Error parsing saved checklist status', e);
    }
  }
  return {};
};

/**
 * Saves checklist item status to localStorage
 */
export const saveChecklistItemStatus = (
  litterId: string, 
  itemId: string, 
  completed: boolean
): void => {
  const savedStatus = localStorage.getItem(`${STORAGE_KEY_PREFIX}${litterId}`);
  const statusMap: Record<string, boolean> = savedStatus ? JSON.parse(savedStatus) : {};
  statusMap[itemId] = completed;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${litterId}`, JSON.stringify(statusMap));
};

/**
 * Applies saved completion statuses to checklist items
 */
export const applyStoredStatuses = (
  items: ChecklistItem[], 
  litterId: string
): ChecklistItem[] => {
  const savedStatuses = loadChecklistStatus(litterId);
  
  return items.map(item => ({
    ...item,
    isCompleted: savedStatuses[item.id] ?? item.isCompleted
  }));
};
