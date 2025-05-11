
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a puppy record in the database
 * @param puppyId The ID of the puppy to update
 * @param updateData The data to update
 * @returns The updated puppy record
 */
export const updatePuppy = async (puppyId: string, updateData: any) => {
  const { data, error } = await supabase
    .from('puppies')
    .update(updateData)
    .eq('id', puppyId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating puppy:', error);
    throw new Error(`Failed to update puppy: ${error.message}`);
  }
  
  return data;
};

/**
 * Deletes a puppy record from the database
 * @param puppyId The ID of the puppy to delete
 */
export const deletePuppy = async (puppyId: string) => {
  const { error } = await supabase
    .from('puppies')
    .delete()
    .eq('id', puppyId);
    
  if (error) {
    console.error('Error deleting puppy:', error);
    throw new Error(`Failed to delete puppy: ${error.message}`);
  }
  
  return true;
};
