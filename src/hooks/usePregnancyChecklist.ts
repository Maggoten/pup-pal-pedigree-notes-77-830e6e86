import { useState, useEffect } from 'react';
import { PregnancyChecklist, ChecklistItem, ChecklistGroup, SupabaseChecklistItem } from '@/types/checklist';
import { defaultPregnancyChecklist } from '@/data/pregnancyChecklistData';
import { CURRENT_CHECKLIST_VERSION } from '@/data/pregnancyChecklistData';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePregnancyChecklist = (pregnancyId: string) => {
  const [checklist, setChecklist] = useState<PregnancyChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize or load the checklist
  useEffect(() => {
    const loadChecklist = async () => {
      if (!pregnancyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to load from Supabase first if user is authenticated
        let supabaseChecklist: PregnancyChecklist | null = null;
        
        if (user) {
          supabaseChecklist = await fetchChecklistFromSupabase(pregnancyId, user.id);
        }

        // Load from localStorage as fallback
        const storedChecklist = localStorage.getItem(`pregnancy_checklist_${pregnancyId}`);
        let localChecklist: PregnancyChecklist | null = null;
        
        if (storedChecklist) {
          try {
            localChecklist = JSON.parse(storedChecklist);
            console.log(`[Checklist] Loaded local checklist for pregnancy ${pregnancyId}`, 
                        { version: localChecklist?.version || 'Not versioned' });
          } catch (e) {
            console.error('[Checklist] Failed to parse local checklist:', e);
          }
        }

        // Determine which checklist to use
        let finalChecklist: PregnancyChecklist;

        // If we have a Supabase checklist, use it
        if (supabaseChecklist) {
          console.log(`[Checklist] Using Supabase checklist for pregnancy ${pregnancyId}`);
          finalChecklist = supabaseChecklist;
          
          // If we also have a local checklist but no Supabase version, migrate local data to Supabase
          if (localChecklist && user && (!supabaseChecklist.version || 
              (localChecklist.version && (!supabaseChecklist.version || localChecklist.version > supabaseChecklist.version)))) {
            console.log(`[Checklist] Migrating local checklist to Supabase for pregnancy ${pregnancyId}`);
            syncChecklistToSupabase(localChecklist, user.id);
          }
        } 
        // Otherwise use local checklist or create a new one
        else if (localChecklist) {
          console.log(`[Checklist] Using local checklist for pregnancy ${pregnancyId}`);
          finalChecklist = localChecklist;
          
          // Migrate to Supabase if user is authenticated
          if (user) {
            console.log(`[Checklist] Migrating local checklist to Supabase for pregnancy ${pregnancyId}`);
            syncChecklistToSupabase(localChecklist, user.id);
          }
        } 
        // Create new checklist
        else {
          console.log(`[Checklist] Creating new checklist for pregnancy ${pregnancyId}`);
          finalChecklist = createNewChecklist(pregnancyId);
          
          // Save to localStorage
          localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(finalChecklist));
          
          // Save to Supabase if user is authenticated
          if (user) {
            console.log(`[Checklist] Saving new checklist to Supabase for pregnancy ${pregnancyId}`);
            syncChecklistToSupabase(finalChecklist, user.id);
          }
        }

        // Ensure checklist has the current version
        if (finalChecklist.version !== CURRENT_CHECKLIST_VERSION) {
          finalChecklist.version = CURRENT_CHECKLIST_VERSION;
          // Update local storage
          localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(finalChecklist));
          // Update Supabase if user is authenticated
          if (user) {
            syncChecklistToSupabase(finalChecklist, user.id);
          }
        }

        setChecklist(finalChecklist);
      } catch (err) {
        console.error('[Checklist] Error loading checklist:', err);
        setError('Failed to load checklist. Please try again.');
        
        // Fallback to localStorage or create new checklist
        const storedChecklist = localStorage.getItem(`pregnancy_checklist_${pregnancyId}`);
        
        if (storedChecklist) {
          try {
            setChecklist(JSON.parse(storedChecklist));
          } catch (e) {
            console.error('[Checklist] Failed to parse local checklist:', e);
            const newChecklist = createNewChecklist(pregnancyId);
            setChecklist(newChecklist);
            localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(newChecklist));
          }
        } else {
          const newChecklist = createNewChecklist(pregnancyId);
          setChecklist(newChecklist);
          localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(newChecklist));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadChecklist();
  }, [pregnancyId, user]);

  // Create a new checklist
  const createNewChecklist = (pregnancyId: string): PregnancyChecklist => {
    return {
      id: Date.now().toString(),
      pregnancyId,
      groups: defaultPregnancyChecklist,
      progress: 0,
      version: CURRENT_CHECKLIST_VERSION
    };
  };

  // Fetch checklist from Supabase
  const fetchChecklistFromSupabase = async (pregnancyId: string, userId: string): Promise<PregnancyChecklist | null> => {
    try {
      const { data: supabaseItems, error } = await supabase
        .from('pregnancy_checklists')
        .select('*')
        .eq('pregnancy_id', pregnancyId)
        .eq('user_id', userId);

      if (error) {
        console.error('[Checklist] Supabase fetch error:', error);
        return null;
      }

      if (!supabaseItems || supabaseItems.length === 0) {
        console.log('[Checklist] No items found in Supabase');
        return null;
      }

      console.log(`[Checklist] Found ${supabaseItems.length} items in Supabase`);

      // Convert Supabase items to our checklist format
      const checklistGroups = structuredClone(defaultPregnancyChecklist);

      // Update completion status based on Supabase data
      supabaseItems.forEach((item: SupabaseChecklistItem) => {
        // Find the corresponding week group and item
        const weekGroup = checklistGroups.find(group => 
          group.id === `week${item.week_number}`
        );
        
        if (weekGroup) {
          const checklistItem = weekGroup.items.find(i => i.id === item.item_id);
          if (checklistItem) {
            checklistItem.isCompleted = item.completed;
          }
        }
      });

      const progress = calculateProgress(checklistGroups);

      // Create the final checklist
      return {
        id: Date.now().toString(),
        pregnancyId,
        groups: checklistGroups,
        progress,
        version: CURRENT_CHECKLIST_VERSION
      };
    } catch (err) {
      console.error('[Checklist] Error fetching from Supabase:', err);
      return null;
    }
  };

  // Sync checklist to Supabase
  const syncChecklistToSupabase = async (checklist: PregnancyChecklist, userId: string) => {
    if (!checklist || !userId) return;

    try {
      // Delete existing items first (to handle removed items)
      const { error: deleteError } = await supabase
        .from('pregnancy_checklists')
        .delete()
        .eq('pregnancy_id', checklist.pregnancyId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[Checklist] Error deleting existing items:', deleteError);
        return;
      }

      // Prepare items for insertion
      const items: Omit<SupabaseChecklistItem, 'id' | 'created_at' | 'updated_at'>[] = [];
      
      checklist.groups.forEach(group => {
        // Extract week number from group id (e.g., "week1" => 1)
        const weekNumber = parseInt(group.id.replace('week', ''), 10);
        
        if (isNaN(weekNumber)) {
          console.warn(`[Checklist] Invalid week number in group: ${group.id}`);
          return;
        }
        
        group.items.forEach(item => {
          items.push({
            pregnancy_id: checklist.pregnancyId,
            user_id: userId,
            item_id: item.id,
            week_number: weekNumber,
            completed: item.isCompleted
          });
        });
      });

      // Insert items in batches to avoid payload size limitations
      const batchSize = 50;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('pregnancy_checklists')
          .insert(batch);

        if (insertError) {
          console.error(`[Checklist] Error inserting batch ${i/batchSize + 1}:`, insertError);
        }
      }

      console.log(`[Checklist] Synced ${items.length} items to Supabase for pregnancy ${checklist.pregnancyId}`);
    } catch (err) {
      console.error('[Checklist] Error syncing to Supabase:', err);
    }
  };

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
    
    // Update local state
    setChecklist(updatedChecklist);
    
    // Update localStorage
    localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(updatedChecklist));
    
    // Update Supabase if user is authenticated
    if (user) {
      try {
        // Find the toggled item
        const group = updatedGroups.find(g => g.id === groupId);
        if (!group) return;
        
        const item = group.items.find(i => i.id === itemId);
        if (!item) return;
        
        // Extract week number from group id
        const weekNumber = parseInt(groupId.replace('week', ''), 10);
        
        if (isNaN(weekNumber)) {
          console.warn(`[Checklist] Invalid week number in group: ${groupId}`);
          return;
        }

        // Check if item exists in Supabase
        const { data: existingItems, error: fetchError } = await supabase
          .from('pregnancy_checklists')
          .select('*')
          .eq('pregnancy_id', pregnancyId)
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('week_number', weekNumber);

        if (fetchError) {
          console.error('[Checklist] Error checking item existence:', fetchError);
          return;
        }

        // If item exists, update it
        if (existingItems && existingItems.length > 0) {
          const { error: updateError } = await supabase
            .from('pregnancy_checklists')
            .update({
              completed: item.isCompleted,
              updated_at: new Date().toISOString()
            })
            .eq('pregnancy_id', pregnancyId)
            .eq('user_id', user.id)
            .eq('item_id', itemId)
            .eq('week_number', weekNumber);

          if (updateError) {
            console.error('[Checklist] Error updating item:', updateError);
          } else {
            console.log(`[Checklist] Updated item ${itemId} in week ${weekNumber} to ${item.isCompleted}`);
          }
        } 
        // Otherwise insert it
        else {
          const { error: insertError } = await supabase
            .from('pregnancy_checklists')
            .insert({
              pregnancy_id: pregnancyId,
              user_id: user.id,
              item_id: itemId,
              week_number: weekNumber,
              completed: item.isCompleted
            });

          if (insertError) {
            console.error('[Checklist] Error inserting item:', insertError);
          } else {
            console.log(`[Checklist] Inserted item ${itemId} in week ${weekNumber} with status ${item.isCompleted}`);
          }
        }
      } catch (err) {
        console.error('[Checklist] Error syncing item to Supabase:', err);
      }
    }
    
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
    toggleItemCompletion,
    isLoading,
    error
  };
};
