
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';

/**
 * Checks if the storage bucket exists and is accessible
 */
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${BUCKET_NAME}' exists...`);
    
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      console.error(`Storage bucket check failed for ${BUCKET_NAME}:`, error);
      
      // Try to list buckets to see what's available
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets?.map(b => b.name));
      
      return false;
    }
    
    console.log(`Bucket '${BUCKET_NAME}' exists:`, data);
    return !!data;
  } catch (error) {
    console.error(`Error checking bucket ${BUCKET_NAME}:`, error);
    return false;
  }
};

/**
 * Creates a storage bucket if it doesn't already exist
 * This can be used to ensure the bucket exists before uploads
 */
export const createBucketIfNotExists = async (): Promise<boolean> => {
  try {
    // First check if the bucket already exists
    const bucketExists = await checkBucketExists();
    
    if (bucketExists) {
      return true;
    }
    
    console.log(`Attempting to create bucket '${BUCKET_NAME}'...`);
    
    // Create the bucket if it doesn't exist
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true
    });
    
    if (error) {
      console.error(`Failed to create bucket ${BUCKET_NAME}:`, error);
      return false;
    }
    
    console.log(`Successfully created bucket '${BUCKET_NAME}'`);
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${BUCKET_NAME}:`, error);
    return false;
  }
};
