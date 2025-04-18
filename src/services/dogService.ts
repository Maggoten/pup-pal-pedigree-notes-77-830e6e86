
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

// Remove retry mechanism since it's causing delays
async function executeOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
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
    console.log(`Fetching dogs for user ${userId}`);
    const response = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

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

  const dogForDb = sanitizeDogForDb({
    ...dog,
    owner_id: userId
  });
  
  try {
    const response = await supabase
      .from('dogs')
      .insert([dogForDb as DbDog])
      .select()
      .single();

    if (response.error) {
      console.error('Error adding dog:', response.error.message);
      throw new Error(response.error.message);
    }
    
    return enrichDog(response.data);
  } catch (error) {
    console.error('Failed to add dog:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add dog');
  }
}

/**
 * Updates an existing dog in the database - Optimized for performance
 */
export async function updateDog(id: string, updates: Partial<Dog>) {
  if (!id) {
    console.error('updateDog called without id');
    throw new Error('Dog ID is required');
  }

  const dbUpdates = sanitizeDogForDb(updates);
  
  try {
    // Only update changed fields and return minimal data
    const response = await supabase
      .from('dogs')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, name, updated_at')
      .single();

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
    const response = await supabase
      .from('dogs')
      .delete()
      .eq('id', id);

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
