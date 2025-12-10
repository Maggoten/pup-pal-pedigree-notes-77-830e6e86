
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';

export interface AddMatingDateResult {
  success: boolean;
  heatCycleLinked: boolean;
}

class MatingDatesService {
  /**
   * Find active heat cycle for a dog at a given date
   * Returns null if no active heat cycle found (this is OK - mating can proceed without)
   */
  private async findActiveHeatCycle(femaleId: string, matingDate: Date): Promise<string | null> {
    try {
      const { data: heatCycles } = await supabase
        .from('heat_cycles')
        .select('id, start_date, end_date')
        .eq('dog_id', femaleId)
        .lte('start_date', matingDate.toISOString())
        .order('start_date', { ascending: false })
        .limit(5);

      if (!heatCycles || heatCycles.length === 0) {
        console.log('No heat cycles found for female:', femaleId);
        return null;
      }

      // Find cycle where mating date falls within the cycle period
      // Active cycle = no end_date OR end_date >= mating_date
      for (const cycle of heatCycles) {
        const startDate = new Date(cycle.start_date);
        const endDate = cycle.end_date ? new Date(cycle.end_date) : null;
        
        // Check if mating date is within this cycle
        if (matingDate >= startDate) {
          if (!endDate || matingDate <= endDate) {
            console.log('Found matching heat cycle:', cycle.id);
            return cycle.id;
          }
        }
      }

      console.log('No matching heat cycle found for mating date:', matingDate);
      return null;
    } catch (error) {
      console.error('Error finding heat cycle:', error);
      return null;
    }
  }

  async addMatingDate(litterId: string, date: Date): Promise<AddMatingDateResult> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session');
    }

    const userId = sessionData.session.user.id;

    try {
      console.log(`Starting to add mating date for litter ID: ${litterId}, date: ${date.toISOString()}`);
      
      // Check if there are existing mating dates for this litter
      const { data: existingMatingDates } = await supabase
        .from('mating_dates')
        .select('id, mating_date, pregnancy_id')
        .eq('planned_litter_id', litterId)
        .order('mating_date', { ascending: true });

      const isFirstMating = !existingMatingDates || existingMatingDates.length === 0;
      console.log(`Is first mating: ${isFirstMating}, existing mating dates: ${existingMatingDates?.length || 0}`);
      
      // Get detailed information about the planned litter with all external male fields
      const { data: litter, error: litterError } = await supabase
        .from('planned_litters')
        .select(`
          id, 
          female_id, 
          male_id, 
          female_name, 
          male_name, 
          external_male,
          external_male_breed,
          external_male_registration,
          external_male_image_url
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

      // Get the male name from male_name column (works for both internal and external males)
      let maleName = litter.male_name || '';
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

      // Try to find active heat cycle for this female (optional - can be null)
      const heatCycleId = await this.findActiveHeatCycle(litter.female_id, date);
      if (heatCycleId) {
        console.log('Linking mating to heat cycle:', heatCycleId);
      } else {
        console.log('No active heat cycle found - mating will be saved without heat cycle link');
      }

      let pregnancyId: string;

      if (isFirstMating) {
        // First mating - create new pregnancy with external male info
        console.log("Creating new pregnancy with the following data:");
        const pregnancyData = {
          mating_date: date.toISOString(),
          expected_due_date: expectedDueDate.toISOString(),
          status: 'active',
          user_id: userId,
          female_dog_id: litter.female_id,
          male_dog_id: litter.external_male ? null : litter.male_id,
          external_male_name: litter.external_male ? maleName : null,
          // Fas 2.2: Copy external male info to pregnancy
          external_male_breed: litter.external_male ? litter.external_male_breed : null,
          external_male_registration: litter.external_male ? litter.external_male_registration : null,
          external_male_image_url: litter.external_male ? litter.external_male_image_url : null
        };
        console.log(pregnancyData);

        const { data: pregnancy, error: pregnancyError } = await supabase
          .from('pregnancies')
          .insert(pregnancyData)
          .select()
          .single();

        if (pregnancyError) {
          console.error('Error creating pregnancy:', pregnancyError);
          throw new Error('Failed to create pregnancy');
        }
        
        pregnancyId = pregnancy.id;
        console.log("Successfully created new pregnancy:", pregnancy);
      } else {
        // Subsequent mating - use existing pregnancy
        pregnancyId = existingMatingDates[0].pregnancy_id;
        console.log("Using existing pregnancy:", pregnancyId);
        
        // Update pregnancy if this is an earlier mating date
        const firstMatingDate = new Date(existingMatingDates[0].mating_date);
        if (date < firstMatingDate) {
          const newExpectedDueDate = addDays(date, 63);
          const { error: updateError } = await supabase
            .from('pregnancies')
            .update({
              mating_date: date.toISOString(),
              expected_due_date: newExpectedDueDate.toISOString()
            })
            .eq('id', pregnancyId);
            
          if (updateError) {
            console.error('Error updating pregnancy with earlier date:', updateError);
          } else {
            console.log("Updated pregnancy with earlier mating date");
          }
        }
      }

      // Add the mating date and link it to the pregnancy AND heat cycle
      const { error: matingError } = await supabase
        .from('mating_dates')
        .insert({
          planned_litter_id: litterId,
          mating_date: date.toISOString(),
          pregnancy_id: pregnancyId,
          heat_cycle_id: heatCycleId, // New: link to heat cycle (nullable)
          user_id: userId
        });

      if (matingError) {
        console.error('Error adding mating date:', matingError);
        throw new Error('Failed to add mating date');
      }

      console.log(`Successfully added mating date (${date.toISOString()}) linked to pregnancy ${pregnancyId}${heatCycleId ? ` and heat cycle ${heatCycleId}` : ''} for female ${femaleName} and male ${maleName}`);
      
      return {
        success: true,
        heatCycleLinked: !!heatCycleId
      };
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
