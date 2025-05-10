
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';
import { createStorageError } from '../core/errors';

/**
 * Remove an image from storage
 */
export const removeImage = async (path: string): Promise<{ error: Error | null }> => {
  return removeFromStorage(path);
};

/**
 * Remove any object from storage
 */
export const removeFromStorage = async (path: string): Promise<{ error: Error | null }> => {
  if (!path) {
    return { error: new Error('No path provided for storage object removal') };
  }
  
  try {
    return await deleteStorageObject(path);
  } catch (error) {
    console.error('Error removing from storage:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error removing from storage') };
  }
};

/**
 * Delete a storage object
 */
export const deleteStorageObject = async (path: string): Promise<{ error: Error | null }> => {
  if (!path) {
    return { error: new Error('No path provided for storage object deletion') };
  }
  
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (error) {
      console.error('Supabase storage deletion error:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Unhandled error during storage deletion:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error during storage deletion') };
  }
};
