
import { supabase } from '@/integrations/supabase/client';
import { PlannedLitter } from '@/types/breeding';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { PlannedLitterFormValues } from './types';

// Function to fetch planned litters for a specific user
export const fetchPlannedLitters = async (userId: string): Promise<PlannedLitter[]> => {
  try {
    // Fetch planned litters from Supabase for the current user
    const { data, error } = await fetchWithRetry(
      () => supabase
        .from('planned_litters')
        .select('*, dam:dam_id(*), sire:sire_id(*)')
        .eq('user_id', userId)
        .order('expected_heat_date', { ascending: true }),
      {
        maxRetries: 3,
        initialDelay: 1000
      }
    );
    
    if (error) {
      console.error("Error fetching planned litters:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length} planned litters for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error("Error fetching planned litters:", error);
    return [];
  }
};

// Create a planned litter
export const createPlannedLitter = async (formValues: PlannedLitterFormValues): Promise<PlannedLitter> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('planned_litters')
      .insert({
        user_id: userData.user.id,
        male_id: formValues.externalMale ? null : formValues.maleId,
        female_id: formValues.femaleId,
        female_name: formValues.femaleName,
        male_name: formValues.externalMale ? formValues.externalMaleName : formValues.maleName,
        external_male: formValues.externalMale,
        external_male_name: formValues.externalMaleName || null,
        external_male_breed: formValues.externalMaleBreed || null,
        external_male_registration: formValues.externalMaleRegistration || null,
        expected_heat_date: formValues.expectedHeatDate.toISOString(),
        notes: formValues.notes || null
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as PlannedLitter;
  } catch (error) {
    console.error('Error creating planned litter:', error);
    throw error;
  }
};

// Add a mating date to a planned litter
export const addMatingDate = async (litterId: string, date: Date): Promise<void> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Insert mating date
    const { data, error } = await supabase
      .from('mating_dates')
      .insert({
        planned_litter_id: litterId,
        mating_date: date.toISOString(),
        user_id: userData.user.id
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
  } catch (error) {
    console.error('Error adding mating date:', error);
    throw error;
  }
};

// Edit a mating date
export const editMatingDate = async (litterId: string, dateIndex: number, newDate: Date): Promise<void> => {
  try {
    // Get all mating dates for the litter
    const { data: matingDates, error: fetchError } = await supabase
      .from('mating_dates')
      .select()
      .eq('planned_litter_id', litterId)
      .order('mating_date', { ascending: true });
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Check if dateIndex is valid
    if (!matingDates || dateIndex >= matingDates.length) {
      throw new Error('Invalid date index');
    }
    
    // Update the specific mating date
    const matingId = matingDates[dateIndex].id;
    const { error } = await supabase
      .from('mating_dates')
      .update({ mating_date: newDate.toISOString() })
      .eq('id', matingId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error editing mating date:', error);
    throw error;
  }
};

// Delete a mating date
export const deleteMatingDate = async (litterId: string, dateIndex: number): Promise<void> => {
  try {
    // Get all mating dates for the litter
    const { data: matingDates, error: fetchError } = await supabase
      .from('mating_dates')
      .select()
      .eq('planned_litter_id', litterId)
      .order('mating_date', { ascending: true });
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Check if dateIndex is valid
    if (!matingDates || dateIndex >= matingDates.length) {
      throw new Error('Invalid date index');
    }
    
    // Delete the specific mating date
    const matingId = matingDates[dateIndex].id;
    const { error } = await supabase
      .from('mating_dates')
      .delete()
      .eq('id', matingId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting mating date:', error);
    throw error;
  }
};

// Function to load planned litters for current user
export const loadPlannedLitters = async (): Promise<PlannedLitter[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }
    
    return await fetchPlannedLitters(userData.user.id);
  } catch (error) {
    console.error('Error loading planned litters:', error);
    return [];
  }
};

// Export the service with all functions
export const plannedLittersService = {
  fetchPlannedLitters,
  createPlannedLitter,
  addMatingDate,
  editMatingDate,
  deleteMatingDate,
  loadPlannedLitters
};
