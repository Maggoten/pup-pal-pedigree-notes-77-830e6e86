
import { useState, useEffect } from 'react';
import { PregnancyChecklist, ChecklistItem, ChecklistGroup } from '@/types/checklist';
import { defaultPregnancyChecklist } from '@/data/pregnancyChecklistData';
import { toast } from '@/components/ui/use-toast';

export const usePregnancyChecklist = (pregnancyId: string) => {
  const [checklist, setChecklist] = useState<PregnancyChecklist | null>(null);

  useEffect(() => {
    // Load checklist from localStorage
    const storedChecklist = localStorage.getItem(`pregnancy_checklist_${pregnancyId}`);
    
    if (storedChecklist) {
      setChecklist(JSON.parse(storedChecklist));
    } else {
      // Initialize with default items
      const newChecklist: PregnancyChecklist = {
        id: Date.now().toString(),
        pregnancyId,
        groups: defaultPregnancyChecklist,
        progress: 0
      };
      
      setChecklist(newChecklist);
      localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(newChecklist));
    }
  }, [pregnancyId]);

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
    localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(updatedChecklist));
    
    // Show a toast for newly completed items
    const item = updatedGroups
      .flatMap(group => group.items)
      .find(item => item.id === itemId);
      
    if (item && item.isCompleted) {
      toast({
        title: "Symptom recorded!",
        description: `You've recorded: ${item.text}`,
      });
    }
  };

  return {
    checklist,
    toggleItemCompletion
  };
};
