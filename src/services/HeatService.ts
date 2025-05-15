
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { safeFilter } from '@/utils/supabaseTypeUtils';

// Add a heat record to a dog
export const addHeatRecord = async (dogId: string, date: Date): Promise<boolean> => {
  try {
    // Fetch the current dog
    const { data: dogData, error: fetchError } = await safeFilter(
      supabase.from('dogs').select('heatHistory'),
      'id',
      dogId
    ).single();
    
    if (fetchError) {
      console.error("Error fetching dog for heat record:", fetchError);
      return false;
    }
    
    // Extract current heat history or create empty array
    const currentHeatHistory = dogData?.heatHistory || [];
    
    // Add new heat record
    const newHeatHistory = [
      ...currentHeatHistory,
      {
        date: date.toISOString(),
        added: new Date().toISOString()
      }
    ];
    
    // Update the dog with the new heat history
    const { error: updateError } = await safeFilter(
      supabase.from('dogs').update({ heatHistory: newHeatHistory }),
      'id',
      dogId
    );
    
    if (updateError) {
      console.error("Error updating dog heat history:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating dog heat history:", error);
    return false;
  }
};

// Delete a heat record from a dog
export const deleteHeatRecord = async (dogId: string, heatIndex: number): Promise<boolean> => {
  try {
    // Fetch the current dog
    const { data: dogData, error: fetchError } = await safeFilter(
      supabase.from('dogs').select('heatHistory'),
      'id',
      dogId
    ).single();
    
    if (fetchError || !dogData) {
      console.error("Error fetching dog for deleting heat record:", fetchError);
      return false;
    }
    
    // Make sure we have heat history and valid index
    const heatHistory = dogData.heatHistory || [];
    if (!Array.isArray(heatHistory) || heatIndex < 0 || heatIndex >= heatHistory.length) {
      console.error("Invalid heat history or index:", heatHistory, heatIndex);
      return false;
    }
    
    // Create new heat history with the selected entry removed
    const newHeatHistory = [
      ...heatHistory.slice(0, heatIndex),
      ...heatHistory.slice(heatIndex + 1)
    ];
    
    // Update the dog with the new heat history
    const { error: updateError } = await safeFilter(
      supabase.from('dogs').update({ heatHistory: newHeatHistory }),
      'id',
      dogId
    );
    
    if (updateError) {
      console.error("Error deleting dog heat record:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception deleting dog heat record:", error);
    return false;
  }
};

// Update a dog's heat interval
export const updateHeatInterval = async (dogId: string, interval: number): Promise<boolean> => {
  try {
    const { error } = await safeFilter(
      supabase.from('dogs').update({ heatInterval: interval }),
      'id',
      dogId
    );
    
    if (error) {
      console.error("Error updating dog heat interval:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating dog heat interval:", error);
    return false;
  }
};
