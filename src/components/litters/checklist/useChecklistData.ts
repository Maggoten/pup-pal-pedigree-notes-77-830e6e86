
import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { Litter } from '@/types/breeding';
import { ChecklistItem, timelineSegments } from './types';
import { generateChecklist, saveChecklistItemStatus } from './checklistService';

export const useChecklistData = (litter: Litter, onToggleItem: (itemId: string, completed: boolean) => void) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  
  // Load checklist when litter changes
  useEffect(() => {
    setChecklist(generateChecklist(litter));
  }, [litter]);
  
  const birthDate = parseISO(litter.dateOfBirth);
  const today = new Date();
  const puppyAge = differenceInDays(today, birthDate);
  const puppyWeeks = differenceInWeeks(today, birthDate);
  
  // Calculate completion statistics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.isCompleted).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Handle toggling an item's completion status
  const handleToggle = useCallback((itemId: string) => {
    const item = checklist.find(item => item.id === itemId);
    if (item) {
      const newStatus = !item.isCompleted;
      
      // Update local state immediately
      setChecklist(prev => prev.map(i => 
        i.id === itemId ? { ...i, isCompleted: newStatus } : i
      ));
      
      // Save to localStorage
      saveChecklistItemStatus(litter.id, itemId, newStatus);
      
      // Call the parent handler
      onToggleItem(itemId, newStatus);
    }
  }, [checklist, litter.id, onToggleItem]);
  
  // Filter items based on active category and current puppy age
  const getFilteredItems = useCallback((compact: boolean = false) => {
    let filtered = checklist;
    
    // For compact view, show only relevant items based on current puppy age
    if (compact) {
      filtered = filtered.filter(item => 
        puppyAge >= item.age - 7 && // Show items starting 1 week before they're due
        puppyAge <= item.age + 14   // Keep showing items for 2 weeks after they're due
      );
    }
    
    return filtered;
  }, [checklist, puppyAge]);
  
  // Group items by timeline segment (week ranges)
  const getItemsByTimeline = useCallback((filteredItems: ChecklistItem[]) => {
    return timelineSegments.map(segment => ({
      ...segment,
      items: filteredItems.filter(item => item.age >= segment.min && item.age <= segment.max)
    }));
  }, []);
  
  return {
    activeCategory,
    setActiveCategory,
    checklist,
    puppyAge,
    puppyWeeks,
    completedItems,
    totalItems,
    completionPercentage,
    handleToggle,
    getFilteredItems,
    getItemsByTimeline
  };
};
