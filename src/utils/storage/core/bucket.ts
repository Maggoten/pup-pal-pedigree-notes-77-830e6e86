
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';

/**
 * Checks if the storage bucket exists and is accessible
 */
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      console.error(`Storage bucket check failed for ${BUCKET_NAME}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking bucket ${BUCKET_NAME}:`, error);
    return false;
  }
};

/**
 * Creates a storage bucket if it doesn't already exist
 */
export const createBucketIfNotExists = async (): Promise<boolean> => {
  try {
    // First check if the bucket already exists
    const bucketExists = await checkBucketExists();
    
    if (bucketExists) {
      return true;
    }
    
    // Create the bucket if it doesn't exist
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true
    });
    
    if (error) {
      console.error(`Failed to create bucket ${BUCKET_NAME}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${BUCKET_NAME}:`, error);
    return false;
  }
};
