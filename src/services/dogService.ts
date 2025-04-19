import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const TIMEOUT = 30000; // 30 second timeout

// Updated withTimeout to preserve types and properly handle Supabase query builders
async function withTimeout<T>(promise: Promise<T> | { then(onfulfilled: (value: T) => any): any }, timeoutMs: number): Promise<T> {
  // For Supabase query builders, we need to convert them to promises first
  const actualPromise = (promise instanceof Promise) ? promise : Promise.resolve(promise);
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  
  return Promise.race([actualPromise, timeoutPromise]);
}

/**
 * Fetches all dogs for a specific user
 */
export async function fetchDogs(userId: string) {
  if (!userId) {
    console.error('fetchDogs called without userId');
    return [];
  }

  try {
    console.log(`Fetching dogs for user ${userId}`);
    const response = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      TIMEOUT
    );

    if (response.error) {
      console.error('Error fetching dogs:', response.error.message);
      throw new Error(response.error.message);
    }
    
    console.log(`Retrieved ${response.data?.length || 0} dogs from database`);
    return (response.data || []).map(enrichDog);
  } catch (error) {
    console.error('Failed to fetch dogs:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch dogs');
  }
}

/**
 * Adds a new dog to the database with enhanced error logging
 */
export async function addDog(
  dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>, 
  userId: string
) {
  if (!userId) {
    console.error('addDog called without userId');
    throw new Error('User ID is required');
  }

  try {
    // Pre-validation logging
    console.log('Adding new dog with input:', { ...dog, owner_id: userId });
    
    const dogForDb = sanitizeDogForDb({
      ...dog,
      owner_id: userId
    });
    
    // Log sanitized object before insert
    console.log('Sanitized dog object for DB:', dogForDb);
    
    // Try minimal insert first with required fields
    const minimalDog = {
      name: dogForDb.name,
      owner_id: userId,
      birthdate: dogForDb.birthdate,
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
      // Enhanced error logging
      console.error('Supabase error details:', {
        code: response.error.code,
        message: response.error.message,
        details: response.error.details,
        hint: response.error.hint
      });
      throw new Error(`Database error: ${response.error.message}`);
    }
    
    // If minimal insert succeeds, update with full data
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
        // Return minimal dog data if update fails
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
      // Include any additional context in the error
      throw new Error(`Failed to add dog: ${error.message}`);
    }
    throw new Error('Failed to add dog: Unknown error');
  }
}

/**
 * Updates an existing dog in the database and returns the updated dog data
 */
export async function updateDog(id: string, updates: Partial<Dog>): Promise<Dog | null> {
  if (!id) {
    console.error('updateDog called without id');
    throw new Error('Dog ID is required');
  }

  const dbUpdates = sanitizeDogForDb(updates);
  
  try {
    console.log('Updating dog:', id);
    const updateResponse = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .update(dbUpdates)
        .eq('id', id)
        .select('*'), // Get the complete updated record
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
    console.log('Successfully updated and verified dog:', updatedDog);
    return updatedDog;
  } catch (error) {
    console.error('Failed to update dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update dog');
  }
}

/**
 * Deletes a dog from the database
 */
export async function deleteDog(id: string) {
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
