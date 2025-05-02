
import { supabase } from '@/integrations/supabase/client';
import { DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';
import { cleanupStorageImage } from '@/utils/storageUtils';

export async function deleteDog(id: string): Promise<boolean> {
  if (!id) {
    console.error('deleteDog called without id');
    throw new Error('Dog ID is required');
  }

  try {
    // First fetch the dog data to get the image URL and other details
    console.log('Fetching dog data for deletion:', id);
    const { data: dogToDelete, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching dog data for deletion:', fetchError);
      throw new Error('Could not fetch dog data for deletion');
    }

    // Start a transaction by using a single operation that might fail
    const { error: initTransactionError } = await supabase.rpc('begin_transaction');
    if (initTransactionError) {
      console.log('Using multiple operations as transaction is not supported');
    }

    try {
      // 1. Update pregnancies where this dog is involved to have a status of 'cancelled'
      // First, check pregnancies where the dog is the female
      console.log('Checking for pregnancies where dog is the female...');
      const { error: femalePregnancyError } = await supabase
        .from('pregnancies')
        .update({ status: 'cancelled' })
        .eq('female_dog_id', id);

      if (femalePregnancyError) {
        console.error('Error updating female pregnancies:', femalePregnancyError.message);
        // We'll continue with the process and not throw an error here
      }

      // Then, check pregnancies where the dog is the male
      console.log('Checking for pregnancies where dog is the male...');
      const { error: malePregnancyError } = await supabase
        .from('pregnancies')
        .update({ status: 'cancelled' })
        .eq('male_dog_id', id);
      
      if (malePregnancyError) {
        console.error('Error updating male pregnancies:', malePregnancyError.message);
        // Continue with deletion anyway
      }

      // 2. Handle planned litters - update or delete as appropriate
      // For female dogs (dam) in planned litters, we'll delete the planned litter
      console.log('Checking for planned litters where dog is the female...');
      const { error: femalePlannedLitterError } = await supabase
        .from('planned_litters')
        .delete()
        .eq('female_id', id);
      
      if (femalePlannedLitterError) {
        console.error('Error deleting planned litters for female:', femalePlannedLitterError.message);
      }

      // For male dogs (sire) in planned litters, we set male_id to null (as the column allows null values)
      console.log('Checking for planned litters where dog is the male...');
      const { error: malePlannedLitterError } = await supabase
        .from('planned_litters')
        .update({ 
          male_id: null, 
          male_name: dogToDelete.name + " (deleted)"
        })
        .eq('male_id', id);
      
      if (malePlannedLitterError) {
        console.error('Error updating planned litters for male:', malePlannedLitterError.message);
      }

      // 3. Delete any mating_dates that reference planned litters associated with this dog
      console.log('Cleaning up related mating dates...');
      // First get planned litter IDs where this dog was involved
      const { data: relatedPlannedLitters } = await supabase
        .from('planned_litters')
        .select('id')
        .or(`female_id.eq.${id},male_id.eq.${id}`);
      
      if (relatedPlannedLitters && relatedPlannedLitters.length > 0) {
        const plannedLitterIds = relatedPlannedLitters.map(litter => litter.id);
        
        // Delete mating dates for these planned litters
        const { error: matingDatesError } = await supabase
          .from('mating_dates')
          .delete()
          .in('planned_litter_id', plannedLitterIds);
        
        if (matingDatesError) {
          console.error('Error deleting related mating dates:', matingDatesError.message);
        }
      }

      // 4. Finally, delete the dog record
      console.log('Deleting dog record:', id);
      const response = await withTimeout<PostgrestResponse<DbDog>>(
        supabase
          .from('dogs')
          .delete()
          .eq('id', id),
        TIMEOUT
      );

      if (response.error) {
        console.error('Error deleting dog:', response.error.message);
        throw new Error(response.error.message);
      }
      
      // 5. After successful deletion, clean up the associated image
      if (dogToDelete.image_url) {
        console.log('Cleaning up deleted dog\'s image');
        await cleanupStorageImage({
          oldImageUrl: dogToDelete.image_url,
          userId: dogToDelete.owner_id,
          excludeDogId: id
        });
      }
      
      console.log('Successfully deleted dog:', id);
      return true;
    } catch (error) {
      // If anything fails, propagate the error
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete dog');
  }
}
