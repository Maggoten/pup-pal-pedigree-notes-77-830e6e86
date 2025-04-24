import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';

class MatingDatesService {
  async addMatingDate(litterId: string, date: Date): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session');
    }

    const userId = sessionData.session.user.id;

    // Get detailed information about the planned litter
    const { data: litter, error: litterError } = await supabase
      .from('planned_litters')
      .select(`
        id, 
        female_id, 
        male_id, 
        female_name, 
        male_name, 
        external_male, 
        external_male_name
      `)
      .eq('id', litterId)
      .single();

    if (litterError || !litter) {
      console.error('Error fetching planned litter:', litterError);
      throw new Error('Failed to fetch planned litter details');
    }

    console.log("Creating pregnancy from litter:", litter);

    // Calculate expected due date (63 days from mating)
    const expectedDueDate = addDays(date, 63);

    // Create a new pregnancy record with explicit active status
    const { data: pregnancy, error: pregnancyError } = await supabase
      .from('pregnancies')
      .insert({
        mating_date: date.toISOString(),
        expected_due_date: expectedDueDate.toISOString(),
        status: 'active',  // Explicitly set status to active
        user_id: userId,
        female_dog_id: litter.female_id,
        male_dog_id: litter.external_male ? null : litter.male_id,
        external_male_name: litter.external_male ? (litter.male_name || litter.external_male_name) : null
      })
      .select()
      .single();

    if (pregnancyError) {
      console.error('Error creating pregnancy:', pregnancyError);
      throw new Error('Failed to create pregnancy');
    }

    console.log("Successfully created pregnancy:", pregnancy);

    // Add the mating date and link it to the pregnancy
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
      throw new Error('Failed to add mating date');
    }

    console.log("Successfully added mating date");
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

    const { error: updateMatingError } = await supabase
      .from('mating_dates')
      .update({ mating_date: newDate.toISOString() })
      .eq('id', matingDateToUpdate.id);

    if (updateMatingError) {
      console.error('Error updating mating date:', updateMatingError);
      return;
    }

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

export const matingDatesService = new MatingDatesService();
