
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';

export async function updateDog(id: string, updates: Partial<Dog>): Promise<Dog | null> {
  if (!id) {
    console.error('updateDog called without id');
    throw new Error('Dog ID is required');
  }

  const dbUpdates = sanitizeDogForDb(updates);
  
  try {
    console.log('Updating dog with ID:', id, 'Updates:', dbUpdates);
    const updateResponse = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .update(dbUpdates)
        .eq('id', id)
        .select('*'),
      TIMEOUT
    );

    if (updateResponse.error) {
      console.error('Error updating dog:', updateResponse.error.message);
      throw new Error(updateResponse.error.message);
    }

    if (!updateResponse.data?.[0]) {
      console.error('No dog data returned after update');
      return null;
    }

    const updatedDog = enrichDog(updateResponse.data[0]);
    console.log('Successfully updated dog:', updatedDog);
    return updatedDog;
  } catch (error) {
    console.error('Failed to update dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update dog');
  }
}
