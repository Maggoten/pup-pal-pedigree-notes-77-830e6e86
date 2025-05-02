
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
    // First fetch the dog data to get the image URL
    const { data: dogToDelete, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching dog data for deletion:', fetchError);
      throw new Error('Could not fetch dog data for deletion');
    }

    // Delete the dog record
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
    
    // After successful deletion, clean up the associated image
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
    console.error('Failed to delete dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete dog');
  }
}
