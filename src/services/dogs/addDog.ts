
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';
import { dateToISOString } from '@/utils/dateUtils';

export async function addDog(
  dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>, 
  userId: string
): Promise<Dog> {
  if (!userId) {
    console.error('addDog called without userId');
    throw new Error('User ID is required');
  }

  try {
    console.log('Adding new dog with input:', { ...dog, owner_id: userId });
    
    const dogForDb = sanitizeDogForDb({
      ...dog,
      owner_id: userId
    });
    
    console.log('Sanitized dog object for DB:', dogForDb);
    
    // Create a minimal dog object with clean date format for the initial insert
    const minimalDog = {
      name: dogForDb.name,
      owner_id: userId,
      birthdate: dogForDb.birthdate ? 
        (typeof dogForDb.birthdate === 'string' ? 
          dogForDb.birthdate.split('T')[0] : 
          dateToISOString(dogForDb.birthdate as any)
        ) : null,
      breed: dogForDb.breed,
      gender: dogForDb.gender,
    };
    
    console.log('Attempting minimal insert with:', minimalDog);
    
    const response = await withTimeout<PostgrestSingleResponse<DbDog>>(
      supabase
        .from('dogs')
        .insert([minimalDog])
        .select()
        .single(),
      TIMEOUT
    );

    if (response.error) {
      console.error('Supabase error details:', {
        code: response.error.code,
        message: response.error.message,
        details: response.error.details,
        hint: response.error.hint
      });
      throw new Error(`Database error: ${response.error.message}`);
    }
    
    if (response.data) {
      const fullDog = { ...dogForDb };
      console.log('Updating with full dog data:', fullDog);
      
      const updateResponse = await withTimeout<PostgrestResponse<DbDog>>(
        supabase
          .from('dogs')
          .update(fullDog)
          .eq('id', response.data.id)
          .select()
          .single(),
        TIMEOUT
      );
      
      if (updateResponse.error) {
        console.error('Error updating with full data:', updateResponse.error);
        return enrichDog(response.data);
      }
      
      console.log('Successfully added dog with full data');
      return enrichDog(updateResponse.data);
    }
    
    console.log('Successfully added dog with minimal data');
    return enrichDog(response.data);
  } catch (error) {
    console.error('Failed to add dog:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to add dog: ${error.message}`);
    }
    throw new Error('Failed to add dog: Unknown error');
  }
}
