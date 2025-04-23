
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
    
    // Remove undefined values from dbUpdates to prevent Supabase errors
    const cleanUpdates: Record<string, any> = {};
    Object.entries(dbUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    console.log('Cleaned updates for Supabase:', cleanUpdates);
    
    // Add explicit updated_at timestamp to force update detection
    cleanUpdates.updated_at = new Date().toISOString();
    
    const updateResponse = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*'),
      TIMEOUT
    );

    if (updateResponse.error) {
      console.error('Error updating dog:', updateResponse.error.message, updateResponse.error.details);
      throw new Error(updateResponse.error.message);
    }

    if (!updateResponse.data || updateResponse.data.length === 0) {
      console.error('No dog data returned after update');
      return null;
    }

    const updatedDog = enrichDog(updateResponse.data[0]);
    console.log('Successfully updated dog:', updatedDog);
    return updatedDog;
  } catch (error) {
    console.error('Failed to update dog:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update dog: Unknown error');
  }
}
