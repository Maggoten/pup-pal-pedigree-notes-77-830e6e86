
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';

class MatingDatesService {
  async addMatingDate(litterId: string, date: Date): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session');
    }

    const userId = sessionData.session.user.id;

    try {
      console.log(`Starting to add mating date for litter ID: ${litterId}, date: ${date.toISOString()}`);
      
      // Get detailed information about the planned litter with a more specific query
      const { data: litter, error: litterError } = await supabase
        .from('planned_litters')
        .select(`
          id, 
          female_id, 
          male_id, 
          female_name, 
          male_name, 
          external_male, 
          external_male_name,
          external_male_breed
        `)
        .eq('id', litterId)
        .single();

      if (litterError || !litter) {
        console.error('Error fetching planned litter:', litterError);
        throw new Error('Failed to fetch planned litter details');
      }

      console.log("Creating pregnancy from litter:", litter);
      
      // Validate female dog
      if (!litter.female_id) {
        console.error('Missing female dog ID in planned litter');
        throw new Error('Invalid planned litter: missing female dog');
      }
      
      // Get the female dog details to ensure we have the correct name
      const { data: femaleDog, error: femaleDogError } = await supabase
        .from('dogs')
        .select('name, id')
        .eq('id', litter.female_id)
        .single();
        
      let femaleName = litter.female_name;
      if (femaleDogError) {
        console.error('Error fetching female dog details:', femaleDogError);
      } else {
        console.log(`Female dog for ID ${litter.female_id}:`, femaleDog);
        femaleName = femaleDog?.name || litter.female_name;
      }

      // Get male dog details if it's an internal male
      let maleName = litter.external_male ? litter.external_male_name : litter.male_name;
      if (!litter.external_male && litter.male_id) {
        const { data: maleDog, error: maleDogError } = await supabase
          .from('dogs')
          .select('name')
          .eq('id', litter.male_id)
          .single();
          
        if (!maleDogError && maleDog) {
          maleName = maleDog.name;
          console.log(`Male dog name for ID ${litter.male_id}:`, maleDog.name);
        }
      }

      // Calculate expected due date (63 days from mating)
      const expectedDueDate = addDays(date, 63);

      console.log("Creating pregnancy with the following data:");
      console.log({
        mating_date: date.toISOString(),
        expected_due_date: expectedDueDate.toISOString(),
        status: 'active',
        user_id: userId,
        female_dog_id: litter.female_id,
        male_dog_id: litter.external_male ? null : litter.male_id,
        external_male_name: litter.external_male ? maleName : null
      });

      // Create a new pregnancy record with explicit active status
      const { data: pregnancy, error: pregnancyError } = await supabase
        .from('pregnancies')
        .insert({
          mating_date: date.toISOString(),
          expected_due_date: expectedDueDate.toISOString(),
          status: 'active',
          user_id: userId,
          female_dog_id: litter.female_id,
          male_dog_id: litter.external_male ? null : litter.male_id,
          external_male_name: litter.external_male ? maleName : null
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

      console.log(`Successfully added mating date (${date.toISOString()}) and linked to pregnancy ${pregnancy.id} for female ${femaleName} and male ${maleName}`);
    } catch (error) {
      console.error("Error in addMatingDate:", error);
      throw error;
    }
  }

  async deleteMatingDate(litterId: string, dateIndex: number): Promise<void> {
    const { data: matingDates, error: fetchError } = await supabase
      .from('mating_dates')
      .select('*')
      .eq('planned_litter_id', litterId)
      .order('mating_date', { ascending: true });

    if (fetchError) {
      console.error('Error fetching mating dates:', fetchError);
      throw new Error('Failed to fetch mating dates');
    }

    if (!matingDates || matingDates.length === 0) {
      console.error('No mating dates found for litter:', litterId);
      throw new Error('No mating dates found to delete');
    }

    if (!matingDates[dateIndex]) {
      console.error('Mating date index out of bounds:', dateIndex);
      throw new Error('Mating date not found at the specified index');
    }

    const matingDateToDelete = matingDates[dateIndex];

    // Delete mating_date first to avoid foreign key constraint violation
    const { error: deleteError } = await supabase
      .from('mating_dates')
      .delete()
      .eq('id', matingDateToDelete.id);

    if (deleteError) {
      console.error('Error deleting mating date:', deleteError);
      throw new Error('Failed to delete mating date');
    }

    // Then delete the related pregnancy if it exists
    if (matingDateToDelete.pregnancy_id) {
      const { error: pregnancyError } = await supabase
        .from('pregnancies')
        .delete()
        .eq('id', matingDateToDelete.pregnancy_id);

      if (pregnancyError) {
        console.error('Error deleting pregnancy:', pregnancyError);
        throw new Error('Failed to delete related pregnancy');
      }
    }

    console.log(`Successfully deleted mating date at index ${dateIndex} for litter ${litterId}`);
  }

  async editMatingDate(litterId: string, dateIndex: number, newDate: Date): Promise<void> {
    const { data: matingDates, error: fetchError } = await supabase
      .from('mating_dates')
      .select('*')
      .eq('planned_litter_id', litterId)
      .order('mating_date', { ascending: true });

    if (fetchError) {
      console.error('Error fetching mating dates:', fetchError);
      throw new Error('Failed to fetch mating dates');
    }

    if (!matingDates || matingDates.length === 0) {
      console.error('No mating dates found for litter:', litterId);
      throw new Error('No mating dates found to edit');
    }

    if (!matingDates[dateIndex]) {
      console.error('Mating date index out of bounds:', dateIndex);
      throw new Error('Mating date not found at the specified index');
    }

    const matingDateToUpdate = matingDates[dateIndex];
    const expectedDueDate = addDays(newDate, 63);

    const { error: updateMatingError } = await supabase
      .from('mating_dates')
      .update({ mating_date: newDate.toISOString() })
      .eq('id', matingDateToUpdate.id);

    if (updateMatingError) {
      console.error('Error updating mating date:', updateMatingError);
      throw new Error('Failed to update mating date');
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
        throw new Error('Failed to update related pregnancy');
      }
    }

    console.log(`Successfully updated mating date at index ${dateIndex} for litter ${litterId}`);
  }
}

export const matingDatesService = new MatingDatesService();
