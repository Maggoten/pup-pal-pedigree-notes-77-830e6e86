
import { ChecklistItem } from './types';
import { LitterService } from '@/services/LitterService';
import { useToast } from '@/hooks/use-toast';

// Storage key prefix for checklist data
const STORAGE_KEY_PREFIX = 'litter-checklist-';

// Initialize the service
const litterService = new LitterService();

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
 * Loads checklist status from Supabase
 */
export const loadChecklistStatusFromSupabase = async (litterId: string): Promise<Record<string, boolean>> => {
  try {
    const items = await litterService.loadChecklistItems(litterId);
    const statusMap: Record<string, boolean> = {};
    
    items.forEach(item => {
      statusMap[item.item_id] = item.completed;
    });
    
    return statusMap;
  } catch (error) {
    console.error('Error loading checklist from Supabase:', error);
    return {};
  }
};

/**
 * Saves checklist item status to Supabase and localStorage
 */
export const saveChecklistItemStatusToSupabase = async (
  litterId: string, 
  itemId: string, 
  completed: boolean
): Promise<boolean> => {
  try {
    // Save to Supabase
    const success = await litterService.saveChecklistItem(litterId, itemId, completed);
    
    if (success) {
      // Also save to localStorage as backup
      saveChecklistItemStatus(litterId, itemId, completed);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error saving checklist item to Supabase:', error);
    // Fallback to localStorage only
    saveChecklistItemStatus(litterId, itemId, completed);
    return false;
  }
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

/**
 * Applies Supabase completion statuses to checklist items
 */
export const applySupabaseStatuses = (
  items: ChecklistItem[], 
  supabaseStatuses: Record<string, boolean>
): ChecklistItem[] => {
  return items.map(item => ({
    ...item,
    isCompleted: supabaseStatuses[item.id] ?? item.isCompleted
  }));
};
