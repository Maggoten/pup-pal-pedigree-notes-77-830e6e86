
import { supabase } from '@/integrations/supabase/client';
import { PlannedLitter } from '@/types/breeding';
import { PlannedLitterFormValues } from './types';
import { matingDatesService } from './matingDatesService';
import { verifySession } from '@/utils/auth/sessionManager';
import { fetchWithRetry } from '@/utils/fetchUtils';

class PlannedLittersService {
  async loadPlannedLitters(): Promise<PlannedLitter[]> {
    // First verify session is valid
    const isSessionValid = await verifySession({ skipThrow: true });
    if (!isSessionValid) {
      console.warn('[PlannedLittersService] No valid session for fetching planned litters');
      return [];
    }
    
    // Then fetch the session data
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('[PlannedLittersService] No active session found');
      return [];
    }

    // Use fetchWithRetry for more resilient data loading
    try {
      const response = await fetchWithRetry(
        async () => {
          return await supabase
            .from('planned_litters')
            .select(`
              *,
              mating_dates(*)
            `)
            .eq('user_id', sessionData.session!.user.id);
        },
        {
          maxRetries: 2,
          initialDelay: 1000,
          verifySession: false // Already verified above
        }
      );
      
      const { data: litters, error } = response;
      
      if (error) {
        throw error;
      }

      if (!litters) {
        return [];
      }

      return litters.map(litter => ({
        id: litter.id,
        maleId: litter.male_id || '',
        femaleId: litter.female_id,
        maleName: litter.male_name || '',
        femaleName: litter.female_name,
        expectedHeatDate: litter.expected_heat_date,
        notes: litter.notes,
        matingDates: litter.mating_dates?.map(date => date.mating_date) || [],
        externalMale: litter.external_male || false,
        externalMaleBreed: litter.external_male_breed || '',
        externalMaleRegistration: litter.external_male_registration || ''
      }));
    } catch (error) {
      console.error('[PlannedLittersService] Error loading planned litters:', error);
      throw error;
    }
  }

  async createPlannedLitter(formValues: PlannedLitterFormValues): Promise<PlannedLitter | null> {
    // Verify session before creating
    const isSessionValid = await verifySession({ skipThrow: true });
    if (!isSessionValid) {
      console.warn('[PlannedLittersService] No valid session for creating litter');
      throw new Error('Authentication required. Please log in again.');
    }
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session');
    }

    const { data: litter, error } = await supabase
      .from('planned_litters')
      .insert({
        male_id: formValues.externalMale ? null : formValues.maleId,
        female_id: formValues.femaleId,
        male_name: formValues.externalMale ? formValues.externalMaleName : formValues.maleName,
        female_name: formValues.femaleName,
        expected_heat_date: formValues.expectedHeatDate.toISOString(),
        notes: formValues.notes,
        external_male: formValues.externalMale,
        external_male_breed: formValues.externalMaleBreed,
        external_male_registration: formValues.externalMaleRegistration,
        user_id: sessionData.session.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('[PlannedLittersService] Error creating planned litter:', error);
      return null;
    }

    return {
      id: litter.id,
      maleId: litter.male_id || '',
      femaleId: litter.female_id,
      maleName: litter.male_name || '',
      femaleName: litter.female_name,
      expectedHeatDate: litter.expected_heat_date,
      notes: litter.notes,
      matingDates: [],
      externalMale: litter.external_male || false,
      externalMaleBreed: litter.external_male_breed || '',
      externalMaleRegistration: litter.external_male_registration || ''
    };
  }

  // Count method for pagination - avoids fetchhing data just for count
  async getPlannedLittersCount(): Promise<number> {
    // First verify session is valid
    const isSessionValid = await verifySession({ skipThrow: true });
    if (!isSessionValid) {
      return 0;
    }
    
    // Then fetch the session data
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return 0;
    }
    
    try {
      const { count, error } = await supabase
        .from('planned_litters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', sessionData.session.user.id);
      
      if (error) {
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      console.error('[PlannedLittersService] Error counting planned litters:', error);
      return 0;
    }
  }

  // Re-export mating dates methods for backward compatibility
  addMatingDate = matingDatesService.addMatingDate;
  deleteMatingDate = matingDatesService.deleteMatingDate;
  editMatingDate = matingDatesService.editMatingDate;
}

export const plannedLittersService = new PlannedLittersService();
