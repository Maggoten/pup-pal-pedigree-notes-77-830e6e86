
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';

/**
 * Fetches all dogs for a specific user
 */
export async function fetchDogs(userId: string) {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  console.log("🐶 FETCHED DOGS:", data);

  if (error) {
    throw new Error(error.message);
  }
  
  // Apply enrichDog to normalize each dog record
  return (data || []).map(enrichDog);
}

/**
 * Adds a new dog to the database
 */
export async function addDog(
  dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>, 
  userId: string
) {
  // Sanitize dog data for database by removing UI-only fields and mapping field names
  const dogForDb = sanitizeDogForDb({
    ...dog,
    owner_id: userId
  });
  
  // The insert method expects an array of objects
  const { data, error } = await supabase
    .from('dogs')
    .insert([dogForDb as DbDog])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  // Return the enriched dog to ensure all UI fields are present
  return enrichDog(data);
}

/**
 * Updates an existing dog in the database
 */
export async function updateDog(id: string, updates: Partial<Dog>) {
  // Sanitize updates for database
  const dbUpdates = sanitizeDogForDb(updates);
  
  const { error } = await supabase
    .from('dogs')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  return true;
}

/**
 * Deletes a dog from the database
 */
export async function deleteDog(id: string) {
  const { error } = await supabase
    .from('dogs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  return true;
}
