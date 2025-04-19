
import { supabase } from '@/integrations/supabase/client';
import { DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';

export async function deleteDog(id: string): Promise<boolean> {
  if (!id) {
    console.error('deleteDog called without id');
    throw new Error('Dog ID is required');
  }

  try {
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
    
    console.log('Successfully deleted dog:', id);
    return true;
  } catch (error) {
    console.error('Failed to delete dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete dog');
  }
}
