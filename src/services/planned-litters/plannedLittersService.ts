
import { supabase } from '@/integrations/supabase/client';
import { PlannedLitter } from '@/types/breeding';
import { PlannedLitterFormValues, plannedLitterFormSchema } from './types';
import { toast } from '@/hooks/use-toast';

// Helper for checking session validity
const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) {
      console.error("No valid session found");
      return null;
    }
    return session.user.id;
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
};

export const plannedLittersService = {
  /**
   * Load all planned litters for the current user
   */
  loadPlannedLitters: async (): Promise<PlannedLitter[]> => {
    console.log("[PlannedLittersService] Loading planned litters");
    
    const userId = await checkSession();
    if (!userId) {
      console.error("[PlannedLittersService] No valid user session");
      return [];
    }

    try {
      console.log(`[PlannedLittersService] Fetching planned litters for user ${userId}`);
      
      // First, get all planned litters
      const { data: plannedLittersData, error } = await supabase
        .from('planned_litters')
        .select(`
          *,
          male:male_id(id, name, breed, image_url),
          female:female_id(id, name, breed, image_url)
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('[PlannedLittersService] Error fetching planned litters:', error);
        throw error;
      }
      
      // Then, for each planned litter, get its mating dates
      const plannedLittersWithMatingDates = await Promise.all(plannedLittersData.map(async (litter) => {
        const { data: matingDates, error: matingError } = await supabase
          .from('mating_dates')
          .select('*')
          .eq('planned_litter_id', litter.id)
          .order('mating_date', { ascending: false });
        
        if (matingError) {
          console.error(`[PlannedLittersService] Error fetching mating dates for litter ${litter.id}:`, matingError);
          return {
            ...litter,
            matingDates: []
          };
        }
        
        return {
          ...litter,
          matingDates: matingDates || []
        };
      }));
      
      console.log(`[PlannedLittersService] Loaded ${plannedLittersWithMatingDates.length} planned litters with mating dates`);
      return plannedLittersWithMatingDates;
    } catch (error) {
      console.error('[PlannedLittersService] Error in loadPlannedLitters:', error);
      throw error;
    }
  },
  
  /**
   * Create a new planned litter
   */
  createPlannedLitter: async (data: PlannedLitterFormValues): Promise<PlannedLitter | null> => {
    console.log("[PlannedLittersService] Creating new planned litter:", data);
    
    const userId = await checkSession();
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create planned litters",
        variant: "destructive"
      });
      throw new Error("No valid session");
    }

    try {
      // Validate the form data
      const validatedData = plannedLitterFormSchema.parse(data);
      
      // Create a new planned litter entry
      const { data: newLitter, error } = await supabase
        .from('planned_litters')
        .insert({
          user_id: userId,
          male_id: validatedData.externalMale ? null : validatedData.maleId,
          female_id: validatedData.femaleId,
          female_name: validatedData.femaleName,
          male_name: validatedData.externalMale ? null : validatedData.maleName,
          external_male: validatedData.externalMale,
          external_male_name: validatedData.externalMale ? validatedData.externalMaleName : null,
          external_male_breed: validatedData.externalMale ? validatedData.externalMaleBreed : null,
          external_male_registration: validatedData.externalMale ? validatedData.externalMaleRegistration : null,
          expected_heat_date: validatedData.expectedHeatDate,
          notes: validatedData.notes || null
        })
        .select(`
          *,
          male:male_id(id, name, breed, image_url),
          female:female_id(id, name, breed, image_url)
        `)
        .single();
      
      if (error) {
        console.error('[PlannedLittersService] Error creating planned litter:', error);
        throw error;
      }
      
      console.log('[PlannedLittersService] Created new planned litter:', newLitter);
      return { 
        ...newLitter, 
        matingDates: [] 
      };
    } catch (error) {
      console.error('[PlannedLittersService] Error in createPlannedLitter:', error);
      throw error;
    }
  },
  
  /**
   * Add a mating date to a planned litter
   */
  addMatingDate: async (plannedLitterId: string, date: Date): Promise<void> => {
    console.log(`[PlannedLittersService] Adding mating date ${date.toISOString()} to litter ${plannedLitterId}`);
    
    const userId = await checkSession();
    if (!userId) throw new Error("No valid session");

    try {
      // Get the planned litter info
      const { data: litter, error: litterError } = await supabase
        .from('planned_litters')
        .select('*')
        .eq('id', plannedLitterId)
        .eq('user_id', userId)
        .single();
      
      if (litterError) {
        console.error('[PlannedLittersService] Error fetching planned litter:', litterError);
        throw litterError;
      }
      
      if (!litter) {
        throw new Error("Planned litter not found or not owned by current user");
      }
      
      // Add the mating date
      const { error: matingError } = await supabase
        .from('mating_dates')
        .insert({
          planned_litter_id: plannedLitterId,
          mating_date: date,
          user_id: userId
        });
      
      if (matingError) {
        console.error('[PlannedLittersService] Error adding mating date:', matingError);
        throw matingError;
      }
      
      // TBD: Create pregnancy record in a different function
    } catch (error) {
      console.error('[PlannedLittersService] Error in addMatingDate:', error);
      throw error;
    }
  },
  
  /**
   * Edit a mating date in a planned litter
   */
  editMatingDate: async (plannedLitterId: string, dateIndex: number, newDate: Date): Promise<void> => {
    console.log(`[PlannedLittersService] Editing mating date at index ${dateIndex} for litter ${plannedLitterId}`);
    
    const userId = await checkSession();
    if (!userId) throw new Error("No valid session");

    try {
      // Get all mating dates for this litter
      const { data: matingDates, error: fetchError } = await supabase
        .from('mating_dates')
        .select('*')
        .eq('planned_litter_id', plannedLitterId)
        .eq('user_id', userId)
        .order('mating_date', { ascending: false });
      
      if (fetchError) {
        console.error('[PlannedLittersService] Error fetching mating dates:', fetchError);
        throw fetchError;
      }
      
      if (!matingDates || matingDates.length === 0 || !matingDates[dateIndex]) {
        throw new Error("Mating date not found");
      }
      
      // Update the mating date
      const matingDateId = matingDates[dateIndex].id;
      const { error: updateError } = await supabase
        .from('mating_dates')
        .update({ mating_date: newDate })
        .eq('id', matingDateId)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('[PlannedLittersService] Error updating mating date:', updateError);
        throw updateError;
      }
      
      // TBD: Update pregnancy due date if exists
    } catch (error) {
      console.error('[PlannedLittersService] Error in editMatingDate:', error);
      throw error;
    }
  },
  
  /**
   * Delete a mating date from a planned litter
   */
  deleteMatingDate: async (plannedLitterId: string, dateIndex: number): Promise<void> => {
    console.log(`[PlannedLittersService] Deleting mating date at index ${dateIndex} for litter ${plannedLitterId}`);
    
    const userId = await checkSession();
    if (!userId) throw new Error("No valid session");

    try {
      // Get all mating dates for this litter
      const { data: matingDates, error: fetchError } = await supabase
        .from('mating_dates')
        .select('*')
        .eq('planned_litter_id', plannedLitterId)
        .eq('user_id', userId)
        .order('mating_date', { ascending: false });
      
      if (fetchError) {
        console.error('[PlannedLittersService] Error fetching mating dates:', fetchError);
        throw fetchError;
      }
      
      if (!matingDates || matingDates.length === 0 || !matingDates[dateIndex]) {
        throw new Error("Mating date not found");
      }
      
      // Delete the mating date
      const matingDateId = matingDates[dateIndex].id;
      const { error: deleteError } = await supabase
        .from('mating_dates')
        .delete()
        .eq('id', matingDateId)
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('[PlannedLittersService] Error deleting mating date:', deleteError);
        throw deleteError;
      }
      
      // TBD: Delete pregnancy if exists
    } catch (error) {
      console.error('[PlannedLittersService] Error in deleteMatingDate:', error);
      throw error;
    }
  }
};

export const fetchPlannedLitters = plannedLittersService.loadPlannedLitters;
