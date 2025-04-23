
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

  try {
    console.log('Starting dog update process for ID:', id);
    
    // Convert Dog object to database format
    const dbUpdates = sanitizeDogForDb(updates);
    
    // Remove undefined values from dbUpdates to prevent Supabase errors
    const cleanUpdates: Record<string, any> = {};
    Object.entries(dbUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    // Only proceed with update if there are actual changes
    if (Object.keys(cleanUpdates).length === 0) {
      console.log('No changes detected, skipping update');
      
      // If no changes, fetch the current dog data to return
      const { data: currentDog, error: fetchError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current dog data:', fetchError);
        return null;
      }
      
      return enrichDog(currentDog);
    }
    
    console.log('Cleaned updates for Supabase:', cleanUpdates);
    
    // Add explicit updated_at timestamp to force update detection
    cleanUpdates.updated_at = new Date().toISOString();
    
    // Execute the update with timeout protection
    const updateResponse = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*'),
      TIMEOUT
    );

    // Handle Supabase error
    if (updateResponse.error) {
      console.error('Supabase error updating dog:', updateResponse.error.message, updateResponse.error.details);
      throw new Error(`Database error: ${updateResponse.error.message}`);
    }

    // Handle missing data in response
    if (!updateResponse.data || updateResponse.data.length === 0) {
      console.error('No dog data returned after update');
      throw new Error('Update succeeded but no data was returned');
    }

    // Convert DB response to Dog object
    const updatedDog = enrichDog(updateResponse.data[0]);
    console.log('Successfully updated dog:', updatedDog);
    return updatedDog;
  } catch (error) {
    // Enhanced error logging
    console.error('Failed to update dog:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.stack);
    }
    
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update dog: Unknown error');
  }
}
