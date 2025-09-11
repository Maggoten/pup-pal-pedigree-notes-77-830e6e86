
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PreBreedingChecklist, ChecklistItem, ChecklistGroup } from '@/types/checklist';
import { defaultPreBreedingChecklist } from '@/data/preBreedingChecklistData';
import { toast } from '@/components/ui/use-toast';
import {
  loadPreBreedingChecklistFromSupabase,
  savePreBreedingChecklistItemToSupabase,
  applySupabaseStatuses,
  applyStoredStatuses
} from '@/services/preBreedingChecklistService';

export const usePreBreedingChecklist = (plannedLitterId: string) => {
  const { t } = useTranslation('plannedLitters');
  const [checklist, setChecklist] = useState<PreBreedingChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Translate checklist groups and items
  const translateChecklistGroups = (groups: ChecklistGroup[]): ChecklistGroup[] => {
    return groups.map(group => ({
      ...group,
      title: t(group.title),
      items: group.items.map(item => ({
        ...item,
        text: t(item.text),
        description: item.description ? t(item.description) : undefined
      }))
    }));
  };

  useEffect(() => {
    const loadChecklist = async () => {
      setIsLoading(true);
      try {
        // Try to load from Supabase first
        const supabaseStatuses = await loadPreBreedingChecklistFromSupabase(plannedLitterId);
        
        let updatedGroups: ChecklistGroup[];
        
        // If we have Supabase data, use it
        if (Object.keys(supabaseStatuses).length > 0) {
          updatedGroups = applySupabaseStatuses(defaultPreBreedingChecklist, supabaseStatuses);
        } else {
          // Check if we have localStorage data to migrate
          const storedChecklist = localStorage.getItem(`preBreeding_checklist_${plannedLitterId}`);
          if (storedChecklist) {
            const parsed = JSON.parse(storedChecklist) as PreBreedingChecklist;
            updatedGroups = parsed.groups;
            
            // Migrate localStorage data to Supabase
            for (const group of parsed.groups) {
              for (const item of group.items) {
                if (item.isCompleted) {
                  await savePreBreedingChecklistItemToSupabase(plannedLitterId, item.id, true);
                }
              }
            }
          } else {
            // Use default data
            updatedGroups = [...defaultPreBreedingChecklist];
          }
        }

        // Translate the groups and items
        const translatedGroups = translateChecklistGroups(updatedGroups);
        const progress = calculateProgress(translatedGroups);
        
        const newChecklist: PreBreedingChecklist = {
          id: Date.now().toString(),
          plannedLitterId,
          groups: translatedGroups,
          progress
        };
        
        setChecklist(newChecklist);
      } catch (error) {
        console.error('Error loading pre-breeding checklist:', error);
        // Fallback to localStorage
        const storedChecklist = localStorage.getItem(`preBreeding_checklist_${plannedLitterId}`);
        if (storedChecklist) {
          const parsed = JSON.parse(storedChecklist) as PreBreedingChecklist;
          parsed.groups = translateChecklistGroups(parsed.groups);
          setChecklist(parsed);
        } else {
          // Use default with translations
          const translatedGroups = translateChecklistGroups([...defaultPreBreedingChecklist]);
          const newChecklist: PreBreedingChecklist = {
            id: Date.now().toString(),
            plannedLitterId,
            groups: translatedGroups,
            progress: 0
          };
          setChecklist(newChecklist);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadChecklist();
  }, [plannedLitterId, t]);

  const calculateProgress = (groups: ChecklistGroup[]): number => {
    let totalItems = 0;
    let completedItems = 0;
    
    groups.forEach(group => {
      totalItems += group.items.length;
      completedItems += group.items.filter(item => item.isCompleted).length;
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const toggleItemCompletion = async (groupId: string, itemId: string) => {
    if (!checklist) return;
    
    const updatedGroups = checklist.groups.map(group => {
      if (group.id === groupId) {
        const updatedItems = group.items.map(item => {
          if (item.id === itemId) {
            return { ...item, isCompleted: !item.isCompleted };
          }
          return item;
        });
        return { ...group, items: updatedItems };
      }
      return group;
    });
    
    const progress = calculateProgress(updatedGroups);
    const updatedChecklist = { ...checklist, groups: updatedGroups, progress };
    
    setChecklist(updatedChecklist);
    
    // Save to both Supabase and localStorage
    const targetItem = updatedGroups
      .find(group => group.id === groupId)
      ?.items.find(item => item.id === itemId);
    
    if (targetItem) {
      await savePreBreedingChecklistItemToSupabase(plannedLitterId, itemId, targetItem.isCompleted);
      
      // Also save complete checklist to localStorage as backup
      localStorage.setItem(`preBreeding_checklist_${plannedLitterId}`, JSON.stringify(updatedChecklist));
    }
    
    // Show a toast when all items are completed
    if (progress === 100) {
      toast({
        title: t('preBreeding.checklist.completed'),
        description: t('preBreeding.checklist.completedDescription'),
      });
    }
  };

  return {
    checklist,
    toggleItemCompletion,
    isLoading
  };
};
