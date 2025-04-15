
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

/**
 * Helper function to implement retry logic for Supabase requests
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      console.error('Max retries reached, operation failed:', error);
      throw error;
    }
    
    console.log(`Retrying operation, ${retries} attempts left...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return executeWithRetry(operation, retries - 1, delay);
  }
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
    const response = await executeWithRetry(() => 
      supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
    );

    console.log("🐶 FETCHED DOGS:", response.data);

    if (response.error) {
      console.error('Error fetching dogs:', response.error.message);
      throw new Error(response.error.message);
    }
    
    // Apply enrichDog to normalize each dog record
    return (response.data || []).map(enrichDog);
  } catch (error) {
    console.error('Failed to fetch dogs:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch dogs');
  }
}

/**
 * Adds a new dog to the database
 */
export async function addDog(
  dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>, 
  userId: string
) {
  if (!userId) {
    console.error('addDog called without userId');
    throw new Error('User ID is required');
  }

  // Sanitize dog data for database by removing UI-only fields and mapping field names
  const dogForDb = sanitizeDogForDb({
    ...dog,
    owner_id: userId
  });
  
  try {
    // The insert method expects an array of objects
    const response = await executeWithRetry(() => 
      supabase
        .from('dogs')
        .insert([dogForDb as DbDog])
        .select()
        .single()
    );

    if (response.error) {
      console.error('Error adding dog:', response.error.message);
      throw new Error(response.error.message);
    }
    
    // Return the enriched dog to ensure all UI fields are present
    return enrichDog(response.data);
  } catch (error) {
    console.error('Failed to add dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add dog');
  }
}

/**
 * Updates an existing dog in the database
 */
export async function updateDog(id: string, updates: Partial<Dog>) {
  if (!id) {
    console.error('updateDog called without id');
    throw new Error('Dog ID is required');
  }

  // Sanitize updates for database
  const dbUpdates = sanitizeDogForDb(updates);
  
  try {
    const response = await executeWithRetry(() => 
      supabase
        .from('dogs')
        .update(dbUpdates)
        .eq('id', id)
    );

    if (response.error) {
      console.error('Error updating dog:', response.error.message);
      throw new Error(response.error.message);
    }
    
    return true;
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
    const response = await executeWithRetry(() => 
      supabase
        .from('dogs')
        .delete()
        .eq('id', id)
    );

    if (response.error) {
      console.error('Error deleting dog:', response.error.message);
      throw new Error(response.error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete dog');
  }
}
