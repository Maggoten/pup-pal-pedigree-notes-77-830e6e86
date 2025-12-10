import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { Litter } from '@/types/breeding';
import { ChecklistItem, timelineSegments } from './types';
import { generateChecklist, saveChecklistItemStatus } from './checklistService';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { translateChecklistItems, getTimelineSegmentTranslations } from './getTranslatedChecklistData';

export const useChecklistData = (litter: Litter, onToggleItem: (itemId: string, completed: boolean) => void) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('litters');
  
  // Load checklist when litter changes
  useEffect(() => {
    const loadChecklist = async () => {
      setIsLoading(true);
      try {
        const items = await generateChecklist(litter);
        const translatedItems = translateChecklistItems(items, t);
        setChecklist(translatedItems);
      } catch (error) {
        console.error('Error loading checklist:', error);
        toast({
          title: t('checklist.toasts.error.loadingFailed'),
          description: t('checklist.toasts.error.loadingFailed'),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChecklist();
  }, [litter, toast, t]);
  
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
        
        if (!success) {
          toast({
            title: t('checklist.toasts.error.failedToUpdate'),
            description: t('checklist.toasts.error.failedToUpdate'),
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error saving checklist item:', error);
        toast({
          title: t('checklist.toasts.error.failedToUpdate'),
          description: t('checklist.toasts.error.failedToUpdate'),
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
      
      // Call the parent handler
      onToggleItem(itemId, newStatus);
    }
  }, [checklist, litter.id, onToggleItem, toast, t]);
  
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
  
  // Group items by timeline segment (week ranges) and sort chronologically within each segment
  const getItemsByTimeline = useCallback((filteredItems: ChecklistItem[]) => {
    const translations = getTimelineSegmentTranslations(t);
    return timelineSegments.map(segment => ({
      ...segment,
      name: translations[segment.name] || segment.name,
      items: filteredItems
        .filter(item => item.age >= segment.min && item.age <= segment.max)
        .sort((a, b) => a.age - b.age) // Sort chronologically by age in days
    }));
  }, [t]);
  
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