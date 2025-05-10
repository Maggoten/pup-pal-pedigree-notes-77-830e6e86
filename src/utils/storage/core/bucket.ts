
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, STORAGE_ERRORS } from '../config';

/**
 * Check if a storage bucket exists
 */
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      console.error('Error checking bucket existence:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Failed to check bucket existence:', error);
    return false;
  }
};

/**
 * Create a bucket if it doesn't exist
 */
export const createBucketIfNotExists = async (): Promise<boolean> => {
  try {
    // First check if bucket exists
    const bucketExists = await checkBucketExists();
    
    if (bucketExists) {
      return true;
    }
    
    // Create the bucket if it doesn't exist
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      console.error('Failed to create bucket:', error);
      return false;
    }
    
    console.log(`Bucket "${BUCKET_NAME}" created successfully`);
    return true;
  } catch (error) {
    console.error('Error creating bucket:', error);
    return false;
  }
};
