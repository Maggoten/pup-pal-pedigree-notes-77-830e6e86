
import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { Litter } from '@/types/breeding';
import { ChecklistItem, timelineSegments } from './types';
import { generateChecklist, saveChecklistItemStatus } from './checklistService';
import { useToast } from '@/hooks/use-toast';

export const useChecklistData = (litter: Litter, onToggleItem: (itemId: string, completed: boolean) => void) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Load checklist when litter changes
  useEffect(() => {
    const loadChecklist = async () => {
      setIsLoading(true);
      try {
        const items = await generateChecklist(litter);
        setChecklist(items);
      } catch (error) {
        console.error('Error loading checklist:', error);
        toast({
          title: "Error loading checklist",
          description: "Failed to load checklist items. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChecklist();
  }, [litter, toast]);
  
  const birthDate = parseISO(litter.dateOfBirth);
  const today = new Date();
  const puppyAge = differenceInDays(today, birthDate);
  const puppyWeeks = differenceInWeeks(today, birthDate);
  
  // Calculate completion statistics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.isCompleted).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Handle toggling an item's completion status
  const handleToggle = useCallback(async (itemId: string) => {
    const item = checklist.find(item => item.id === itemId);
    if (item) {
      const newStatus = !item.isCompleted;
      
      // Update local state immediately for responsive UI
      setChecklist(prev => prev.map(i => 
        i.id === itemId ? { ...i, isCompleted: newStatus } : i
      ));
      
      // Save to Supabase
      setIsSaving(true);
      try {
        const success = await saveChecklistItemStatus(litter.id, itemId, newStatus);
        
        if (success) {
          toast({
            title: "Checklist updated",
            description: `Task ${newStatus ? 'completed' : 'unchecked'} successfully.`,
          });
        } else {
          toast({
            title: "Save failed",
            description: "Failed to save to server, but saved locally.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error saving checklist item:', error);
        toast({
          title: "Error saving",
          description: "Failed to save checklist item. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
      
      // Call the parent handler
      onToggleItem(itemId, newStatus);
    }
  }, [checklist, litter.id, onToggleItem, toast]);
  
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
    getItemsByTimeline,
    isLoading,
    isSaving
  };
};
