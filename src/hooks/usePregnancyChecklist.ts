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
    console.log('🔍 Pregnancy Checklist HOOK TRIGGERED ✅', { pregnancyId, userId: user?.id });
    
    const loadChecklist = async () => {
      if (!pregnancyId) {
        console.log('❌ No pregnancy ID provided, skipping checklist load');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to load from Supabase first if user is authenticated
        let supabaseChecklist: PregnancyChecklist | null = null;
        
        if (user) {
          console.log(`🔍 Attempting to fetch checklist from Supabase for pregnancy ${pregnancyId}, user ${user.id}`);
          supabaseChecklist = await fetchChecklistFromSupabase(pregnancyId, user.id);
          console.log('Supabase checklist result:', supabaseChecklist ? 'Found' : 'Not found');
        } else {
          console.log('❌ No authenticated user, skipping Supabase fetch');
        }

        // Load from localStorage as fallback
        const storedChecklist = localStorage.getItem(`pregnancy_checklist_${pregnancyId}`);
        let localChecklist: PregnancyChecklist | null = null;
        
        if (storedChecklist) {
          try {
            localChecklist = JSON.parse(storedChecklist);
            console.log(`📋 Loaded local checklist for pregnancy ${pregnancyId}`, 
                        { version: localChecklist?.version || 'Not versioned' });
          } catch (e) {
            console.error('❌ Failed to parse local checklist:', e);
          }
        } else {
          console.log(`📋 No local checklist found for pregnancy ${pregnancyId}`);
        }

        // Determine which checklist to use
        let finalChecklist: PregnancyChecklist;

        // If we have a Supabase checklist, use it
        if (supabaseChecklist) {
          console.log(`✅ Using Supabase checklist for pregnancy ${pregnancyId}`);
          finalChecklist = supabaseChecklist;
          
          // If we also have a local checklist but no Supabase version, migrate local data to Supabase
          if (localChecklist && user && (!supabaseChecklist.version || 
              (localChecklist.version && (!supabaseChecklist.version || localChecklist.version > supabaseChecklist.version)))) {
            console.log(`🔄 Migrating local checklist to Supabase for pregnancy ${pregnancyId}`);
            syncChecklistToSupabase(localChecklist, user.id);
          }
        } 
        // Otherwise use local checklist or create a new one
        else if (localChecklist) {
          console.log(`📂 Using local checklist for pregnancy ${pregnancyId}`);
          finalChecklist = localChecklist;
          
          // Migrate to Supabase if user is authenticated
          if (user) {
            console.log(`🔄 Migrating local checklist to Supabase for pregnancy ${pregnancyId}`);
            syncChecklistToSupabase(localChecklist, user.id);
          }
        } 
        // Create new checklist
        else {
          console.log(`🆕 Creating new checklist for pregnancy ${pregnancyId}`);
          finalChecklist = createNewChecklist(pregnancyId);
          
          // Save to localStorage
          localStorage.setItem(`pregnancy_checklist_${pregnancyId}`, JSON.stringify(finalChecklist));
          
          // Save to Supabase if user is authenticated
          if (user) {
            console.log(`💾 Saving new checklist to Supabase for pregnancy ${pregnancyId}`);
            try {
              await syncChecklistToSupabase(finalChecklist, user.id);
              console.log('✅ Successfully saved new checklist to Supabase');
            } catch (syncError) {
              console.error('❌ Error saving new checklist to Supabase:', syncError);
            }
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
        console.error('❌ Error loading checklist:', err);
        setError('Failed to load checklist. Please try again.');
        
        // Fallback to localStorage or create new checklist
        const storedChecklist = localStorage.getItem(`pregnancy_checklist_${pregnancyId}`);
        
        if (storedChecklist) {
          try {
            setChecklist(JSON.parse(storedChecklist));
          } catch (e) {
            console.error('❌ Failed to parse local checklist:', e);
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
      console.log(`🔍 Fetching checklist items from Supabase for pregnancy: ${pregnancyId}, user: ${userId}`);

      const { data: supabaseItems, error } = await supabase
        .from('pregnancy_checklists')
        .select('*')
        .eq('pregnancy_id', pregnancyId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Supabase fetch error:', error);
        return null;
      }

      if (!supabaseItems || supabaseItems.length === 0) {
        console.log('📭 No items found in Supabase');
        return null;
      }

      console.log(`📦 Found ${supabaseItems.length} items in Supabase`, supabaseItems);

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
      console.error('❌ Error fetching from Supabase:', err);
      return null;
    }
  };

  // Sync checklist to Supabase
  const syncChecklistToSupabase = async (checklist: PregnancyChecklist, userId: string) => {
    if (!checklist || !userId) return;

    try {
      console.log(`🔄 Starting sync to Supabase for pregnancy ${checklist.pregnancyId}, user ${userId}`);
      
      // Delete existing items first (to handle removed items)
      const { error: deleteError } = await supabase
        .from('pregnancy_checklists')
        .delete()
        .eq('pregnancy_id', checklist.pregnancyId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error deleting existing items:', deleteError);
        return;
      }

      // Prepare items for insertion
      const items: Omit<SupabaseChecklistItem, 'id' | 'created_at' | 'updated_at'>[] = [];
      
      checklist.groups.forEach(group => {
        // Extract week number from group id (e.g., "week1" => 1)
        const weekNumber = parseInt(group.id.replace('week', ''), 10);
        
        if (isNaN(weekNumber)) {
          console.warn(`⚠️ Invalid week number in group: ${group.id}`);
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

      console.log(`🔄 Prepared ${items.length} items for Supabase sync`, items);

      // Insert items in batches to avoid payload size limitations
      const batchSize = 50;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('pregnancy_checklists')
          .insert(batch);

        if (insertError) {
          console.error(`❌ Error inserting batch ${i/batchSize + 1}:`, insertError);
        }
      }

      console.log(`✅ Synced ${items.length} items to Supabase for pregnancy ${checklist.pregnancyId}`);
    } catch (err) {
      console.error('❌ Error syncing to Supabase:', err);
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
    
    console.log(`🔄 Toggling item completion: group ${groupId}, item ${itemId}`);

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
        console.log(`🔄 Syncing toggled item to Supabase: user ${user.id}, pregnancy ${pregnancyId}`);
        
        // Find the toggled item
        const group = updatedGroups.find(g => g.id === groupId);
        if (!group) return;
        
        const item = group.items.find(i => i.id === itemId);
        if (!item) return;
        
        // Extract week number from group id
        const weekNumber = parseInt(groupId.replace('week', ''), 10);
        
        if (isNaN(weekNumber)) {
          console.warn(`⚠️ Invalid week number in group: ${groupId}`);
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
          console.error('❌ Error checking item existence:', fetchError);
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
            console.error('❌ Error updating item:', updateError);
          } else {
            console.log(`✅ Updated item ${itemId} in week ${weekNumber} to ${item.isCompleted}`);
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
            console.error('❌ Error inserting item:', insertError);
          } else {
            console.log(`✅ Inserted item ${itemId} in week ${weekNumber} with status ${item.isCompleted}`);
          }
        }
      } catch (err) {
        console.error('❌ Error syncing item to Supabase:', err);
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
