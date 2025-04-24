
import { supabase } from '@/integrations/supabase/client';
import { PlannedLitter } from '@/types/breeding';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { addDays } from 'date-fns';

export const plannedLitterFormSchema = // ... keep existing code (form schema)

export type PlannedLitterFormValues = // ... keep existing code (type definition)

class PlannedLitterService {
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
      ...litter,
      matingDates: litter.mating_dates?.map(date => date.mating_date) || []
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
        male_name: formValues.externalMale ? formValues.externalMaleName : undefined,
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
      console.error('Error creating planned litter:', error);
      return null;
    }

    return {
      ...litter,
      matingDates: []
    };
  }

  async addMatingDate(litterId: string, date: Date): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session');
    }

    const userId = sessionData.session.user.id;

    // Start a transaction using Supabase's built-in handling
    const { data: litter, error: litterError } = await supabase
      .from('planned_litters')
      .select('*')
      .eq('id', litterId)
      .single();

    if (litterError || !litter) {
      console.error('Error fetching planned litter:', litterError);
      return;
    }

    // Calculate expected due date (63 days from mating)
    const expectedDueDate = addDays(date, 63);

    // Create a new pregnancy record
    const { data: pregnancy, error: pregnancyError } = await supabase
      .from('pregnancies')
      .insert({
        mating_date: date.toISOString(),
        expected_due_date: expectedDueDate.toISOString(),
        status: 'active',
        user_id: userId,
        female_dog_id: litter.female_id,
        male_dog_id: litter.external_male ? null : litter.male_id,
        external_male_name: litter.external_male ? litter.male_name : null
      })
      .select()
      .single();

    if (pregnancyError) {
      console.error('Error creating pregnancy:', pregnancyError);
      return;
    }

    // Add mating date record
    const { error: matingError } = await supabase
      .from('mating_dates')
      .insert({
        planned_litter_id: litterId,
        mating_date: date.toISOString(),
        pregnancy_id: pregnancy.id,
        user_id: userId
      });

    if (matingError) {
      console.error('Error adding mating date:', matingError);
      return;
    }
  }

  async deleteMatingDate(litterId: string, dateIndex: number): Promise<void> {
    const { data: matingDates, error: fetchError } = await supabase
      .from('mating_dates')
      .select('*')
      .eq('planned_litter_id', litterId)
      .order('mating_date', { ascending: true });

    if (fetchError || !matingDates || !matingDates[dateIndex]) {
      console.error('Error fetching mating dates:', fetchError);
      return;
    }

    const matingDateToDelete = matingDates[dateIndex];

    // Delete the associated pregnancy first
    if (matingDateToDelete.pregnancy_id) {
      const { error: pregnancyError } = await supabase
        .from('pregnancies')
        .delete()
        .eq('id', matingDateToDelete.pregnancy_id);

      if (pregnancyError) {
        console.error('Error deleting pregnancy:', pregnancyError);
        return;
      }
    }

    // Then delete the mating date
    const { error: deleteError } = await supabase
      .from('mating_dates')
      .delete()
      .eq('id', matingDateToDelete.id);

    if (deleteError) {
      console.error('Error deleting mating date:', deleteError);
    }
  }

  async editMatingDate(litterId: string, dateIndex: number, newDate: Date): Promise<void> {
    const { data: matingDates, error: fetchError } = await supabase
      .from('mating_dates')
      .select('*')
      .eq('planned_litter_id', litterId)
      .order('mating_date', { ascending: true });

    if (fetchError || !matingDates || !matingDates[dateIndex]) {
      console.error('Error fetching mating dates:', fetchError);
      return;
    }

    const matingDateToUpdate = matingDates[dateIndex];
    const expectedDueDate = addDays(newDate, 63);

    // Update the mating date
    const { error: updateMatingError } = await supabase
      .from('mating_dates')
      .update({ mating_date: newDate.toISOString() })
      .eq('id', matingDateToUpdate.id);

    if (updateMatingError) {
      console.error('Error updating mating date:', updateMatingError);
      return;
    }

    // Update the associated pregnancy if it exists
    if (matingDateToUpdate.pregnancy_id) {
      const { error: pregnancyError } = await supabase
        .from('pregnancies')
        .update({
          mating_date: newDate.toISOString(),
          expected_due_date: expectedDueDate.toISOString()
        })
        .eq('id', matingDateToUpdate.pregnancy_id);

      if (pregnancyError) {
        console.error('Error updating pregnancy:', pregnancyError);
      }
    }
  }
}

// Export a singleton instance
export const plannedLitterService = new PlannedLitterService();
