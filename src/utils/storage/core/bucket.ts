
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, STORAGE_ERRORS } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { verifyStorageSession } from './session';
import { processImageForUpload } from '../imageUtils';

/**
 * Checks if the storage bucket exists
 */
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      console.error('Error checking bucket:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error in checkBucketExists:', error);
    return false;
  }
};

/**
 * Creates the storage bucket if it doesn't exist
 */
export const createBucketIfNotExists = async (): Promise<boolean> => {
  try {
    const bucketExists = await checkBucketExists();
    
    if (bucketExists) {
      return true;
    }
    
    // Create new bucket
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error in createBucketIfNotExists:', error);
    return false;
  }
};

/**
 * Uploads a file to storage and returns its URL
 */
export const uploadFileAndGetUrl = async (file: File, userId: string): Promise<string> => {
  try {
    // Verify session is valid
    await verifyStorageSession();
    
    // Process image for upload (compress it)
    const processedFile = await processImageForUpload(file);
    
    // Create a unique file path with user ID and UUID
    const filePath = `${userId}/${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.message || STORAGE_ERRORS.UPLOAD_FAILED);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error(STORAGE_ERRORS.GET_URL_FAILED);
    }
    
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadFileAndGetUrl:', error);
    // Safely handle potential error objects with different structures
    const errorMessage = error?.message || (error?.error && error.error.message) || 
      (typeof error === 'object' ? JSON.stringify(error) : String(error));
    throw new Error(errorMessage);
  }
};
