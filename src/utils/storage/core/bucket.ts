
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, STORAGE_ERRORS } from '@/utils/storage/config';
import { formatStorageError, hasError } from './errors';
import { toast } from '@/hooks/use-toast';

// Constants
const DOG_PHOTOS_BUCKET = 'images';

/**
 * Checks if the storage bucket exists
 */
export async function checkBucketExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(DOG_PHOTOS_BUCKET);
    
    if (error) {
      console.error(`[Storage] Bucket check error:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`[Storage] Error checking bucket existence:`, error);
    return false;
  }
}

/**
 * Creates the storage bucket if it doesn't exist
 */
export async function createBucketIfNotExists(): Promise<boolean> {
  try {
    const exists = await checkBucketExists();
    
    if (exists) {
      console.log(`[Storage] Bucket ${DOG_PHOTOS_BUCKET} already exists`);
      return true;
    }
    
    console.log(`[Storage] Creating bucket ${DOG_PHOTOS_BUCKET}`);
    
    const { data, error } = await supabase.storage.createBucket(DOG_PHOTOS_BUCKET, {
      public: true,
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error(`[Storage] Failed to create bucket:`, error);
      return false;
    }
    
    console.log(`[Storage] Successfully created bucket ${DOG_PHOTOS_BUCKET}`);
    return true;
  } catch (error) {
    console.error(`[Storage] Error creating bucket:`, error);
    return false;
  }
}

/**
 * Upload a file to storage and return its public URL
 */
export async function uploadFileAndGetUrl(file: File, userId: string): Promise<string | null> {
  try {
    if (!userId) {
      throw new Error('User ID is required for file upload');
    }
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Ensure bucket exists
    const bucketExists = await createBucketIfNotExists();
    if (!bucketExists) {
      throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(DOG_PHOTOS_BUCKET));
    }
    
    console.log(`[Storage] Uploading ${file.name} (${file.size} bytes) to ${DOG_PHOTOS_BUCKET}/${filePath}`);
    
    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DOG_PHOTOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      throw formatStorageError(uploadError);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(DOG_PHOTOS_BUCKET)
      .getPublicUrl(uploadData?.path || filePath);
    
    console.log(`[Storage] File uploaded successfully. Path: ${uploadData?.path}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[Storage] File upload error:', error);
    
    // Show toast for user feedback
    toast({
      title: "Upload Failed",
      description: hasError(error) && error.message ? error.message : 'Failed to upload file',
      variant: "destructive"
    });
    
    return null;
  }
}
