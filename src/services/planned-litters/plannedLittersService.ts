
import { supabase } from '@/integrations/supabase/client';
import { PlannedLitter } from '@/types/breeding';
import { PlannedLitterFormValues } from './types';
import { matingDatesService } from './matingDatesService';

class PlannedLittersService {
  async loadPlannedLitters(): Promise<PlannedLitter[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      return [];
    }

    const { data: litters, error } = await supabase
      .from('planned_litters')
      .select(`
        *,
        mating_dates(*)
      `)
      .eq('user_id', sessionData.session.user.id);

    if (error) {
      console.error('Error loading planned litters:', error);
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
      externalMaleRegistration: litter.external_male_registration || '',
      externalMaleImageUrl: litter.external_male_image_url || ''
    }));
  }

  async createPlannedLitter(formValues: PlannedLitterFormValues): Promise<PlannedLitter | null> {
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
        external_male_image_url: formValues.externalMaleImageUrl,
        user_id: sessionData.session.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating planned litter:', error);
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
      externalMaleRegistration: litter.external_male_registration || '',
      externalMaleImageUrl: litter.external_male_image_url || ''
    };
  }

  async updatePlannedLitter(litterId: string, formValues: PlannedLitterFormValues): Promise<PlannedLitter | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session');
    }

    const { data: litter, error } = await supabase
      .from('planned_litters')
      .update({
        male_id: formValues.externalMale ? null : formValues.maleId,
        female_id: formValues.femaleId,
        male_name: formValues.externalMale ? formValues.externalMaleName : formValues.maleName,
        female_name: formValues.femaleName,
        expected_heat_date: formValues.expectedHeatDate.toISOString(),
        notes: formValues.notes,
        external_male: formValues.externalMale,
        external_male_breed: formValues.externalMaleBreed,
        external_male_registration: formValues.externalMaleRegistration,
        external_male_image_url: formValues.externalMaleImageUrl,
      })
      .eq('id', litterId)
      .eq('user_id', sessionData.session.user.id)
      .select(`
        *,
        mating_dates(*)
      `)
      .single();

    if (error) {
      console.error('Error updating planned litter:', error);
      throw error;
    }

    return {
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
      externalMaleRegistration: litter.external_male_registration || '',
      externalMaleImageUrl: litter.external_male_image_url || ''
    };
  }

  // Re-export mating dates methods for backward compatibility
  addMatingDate = matingDatesService.addMatingDate;
  deleteMatingDate = matingDatesService.deleteMatingDate;
  editMatingDate = matingDatesService.editMatingDate;
}

export const plannedLittersService = new PlannedLittersService();
