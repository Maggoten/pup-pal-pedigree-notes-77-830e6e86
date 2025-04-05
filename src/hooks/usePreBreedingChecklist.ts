
import { useState, useEffect } from 'react';
import { PreBreedingChecklist, ChecklistItem, ChecklistGroup } from '@/types/checklist';
import { defaultPreBreedingChecklist } from '@/data/preBreedingChecklistData';
import { toast } from '@/components/ui/use-toast';

export const usePreBreedingChecklist = (plannedLitterId: string) => {
  const [checklist, setChecklist] = useState<PreBreedingChecklist | null>(null);

  useEffect(() => {
    // Load checklist from localStorage
    const storedChecklist = localStorage.getItem(`preBreeding_checklist_${plannedLitterId}`);
    
    if (storedChecklist) {
      setChecklist(JSON.parse(storedChecklist));
    } else {
      // Initialize with default items
      const newChecklist: PreBreedingChecklist = {
        id: Date.now().toString(),
        plannedLitterId,
        groups: defaultPreBreedingChecklist,
        progress: 0
      };
      
      setChecklist(newChecklist);
      localStorage.setItem(`preBreeding_checklist_${plannedLitterId}`, JSON.stringify(newChecklist));
    }
  }, [plannedLitterId]);

  const calculateProgress = (groups: ChecklistGroup[]): number => {
    let totalItems = 0;
    let completedItems = 0;
    
    groups.forEach(group => {
      totalItems += group.items.length;
      completedItems += group.items.filter(item => item.isCompleted).length;
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const toggleItemCompletion = (groupId: string, itemId: string) => {
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
    localStorage.setItem(`preBreeding_checklist_${plannedLitterId}`, JSON.stringify(updatedChecklist));
    
    // Show a toast when all items are completed
    if (progress === 100) {
      toast({
        title: "Breeding preparation complete!",
        description: "You've completed all pre-breeding tasks. You're ready for the next step!",
      });
    }
  };

  return {
    checklist,
    toggleItemCompletion
  };
};
