
import { supabase } from '@/integrations/supabase/client';
import { DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';
import { cleanupStorageImage } from '@/utils/storage/cleanup';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';

export async function deleteDog(id: string): Promise<boolean> {
  if (!id) {
    console.error('deleteDog called without id');
    throw new Error('Dog ID is required');
  }

  try {
    // First fetch the dog data to get the image URL and owner ID
    const { data: dogToDelete, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching dog data for deletion:', fetchError);
      throw new Error('Could not fetch dog data for deletion');
    }

    console.log('Starting dog deletion process for:', id);

    // Begin a series of cleanup operations
    
    // 1. Delete all calendar events for this dog FIRST
    console.log('Deleting calendar events for this dog...');
    const calendarCleanupSuccess = await ReminderCalendarSyncService.deleteCalendarEventsForDog(id);
    if (!calendarCleanupSuccess) {
      console.warn('Calendar event cleanup failed, but continuing with deletion');
    }
    
    // 2. Clean up references in planned_litters where this dog is used
    console.log('Checking for planned litters using this dog...');
    const { error: plannedLittersErrorMale } = await supabase
      .from('planned_litters')
      .update({ male_id: null, male_name: 'Deleted Dog' })
      .eq('male_id', id);
      
    if (plannedLittersErrorMale) {
      console.error('Error updating planned litters (male references):', plannedLittersErrorMale);
    }
      
    const { error: plannedLittersErrorFemale } = await supabase
      .from('planned_litters')
      .update({ female_name: 'Deleted Dog' })
      .eq('female_id', id);
      
    if (plannedLittersErrorFemale) {
      console.error('Error updating planned litters (female references):', plannedLittersErrorFemale);
    }

    // 3. Handle references in litters table
    console.log('Checking for litters referencing this dog...');
    const { error: littersSireError } = await supabase
      .from('litters')
      .update({ sire_id: null, sire_name: 'Deleted Dog' })
      .eq('sire_id', id);
      
    if (littersSireError) {
      console.error('Error updating litters (sire references):', littersSireError);
    }
    
    const { error: littersDamError } = await supabase
      .from('litters')
      .update({ dam_name: 'Deleted Dog' })
      .eq('dam_id', id);
      
    if (littersDamError) {
      console.error('Error updating litters (dam references):', littersDamError);
    }

    // 4. Handle references in pregnancies table
    console.log('Checking for pregnancies referencing this dog...');
    
    // 4.1 Handle male dog references in pregnancies table
    const { error: pregnanciesMaleError } = await supabase
      .from('pregnancies')
      .update({ male_dog_id: null, external_male_name: 'Deleted Dog' })
      .eq('male_dog_id', id);
    
    if (pregnanciesMaleError) {
      console.error('Error updating pregnancies (male references):', pregnanciesMaleError);
    }

    // 4.2 Handle female dog references in pregnancies table
    // This is critical for female dogs that are referenced as female_dog_id in pregnancies
    console.log('Checking for pregnancies where this dog is the female...');
    const { error: pregnanciesFemaleError } = await supabase
      .from('pregnancies')
      .update({ 
        female_dog_id: null,
        status: 'terminated' // Changed from 'archived' to 'terminated' to comply with check constraint
      })
      .eq('female_dog_id', id);
      
    if (pregnanciesFemaleError) {
      console.error('Error updating pregnancies (female references):', pregnanciesFemaleError);
      throw new Error(`Failed to update pregnancy references: ${pregnanciesFemaleError.message}`);
    }

    // Finally, delete the dog record
    console.log('Deleting dog:', id);
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
    
    // After successful deletion, try to clean up the associated image
    // Only proceed with image cleanup if the dog was successfully deleted
    if (dogToDelete?.image_url) {
      try {
        console.log('Cleaning up deleted dog\'s image');
        await cleanupStorageImage({
          oldImageUrl: dogToDelete.image_url,
          userId: dogToDelete.owner_id,
          excludeDogId: id
        });
      } catch (imageError) {
        // Just log the error but don't fail the overall operation
        console.error('Failed to clean up image, but dog was deleted:', imageError);
      }
    }
    
    console.log('Successfully deleted dog and all associated calendar events:', id);
    return true;
  } catch (error) {
    console.error('Failed to delete dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete dog');
  }
}
