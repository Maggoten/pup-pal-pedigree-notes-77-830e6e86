
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog } from '@/utils/dogUtils';

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
  // Prepare dog data for Supabase by mapping UI field names to DB field names
  const dogForDb = {
    ...dog,
    birthdate: dog.dateOfBirth,
    registration_number: dog.registrationNumber,
    image_url: dog.image,
    // Initialize these fields with empty arrays if they don't exist
    heatHistory: dog.heatHistory || [],
    breedingHistory: dog.breedingHistory || {
      breedings: [],
      litters: [],
      matings: []
    },
    owner_id: userId
  };
  
  const { data, error } = await supabase
    .from('dogs')
    .insert([dogForDb])
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
  // Convert UI field names to DB field names for update
  const dbUpdates: any = { ...updates };
  
  // Handle field name mappings
  if ('dateOfBirth' in updates) {
    dbUpdates.birthdate = updates.dateOfBirth;
    delete dbUpdates.dateOfBirth;
  }
  
  if ('registrationNumber' in updates) {
    dbUpdates.registration_number = updates.registrationNumber;
    delete dbUpdates.registrationNumber;
  }
  
  if ('image' in updates) {
    dbUpdates.image_url = updates.image;
    delete dbUpdates.image;
  }
  
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
