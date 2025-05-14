
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { isStorageError, STORAGE_ERRORS, getSafeErrorMessage } from '@/utils/storage/config';

// All dog photos should go to the 'images' bucket - standardize this
export const STORAGE_BUCKET_NAME = 'images';

/**
 * Creates a new storage bucket if it doesn't already exist
 * @param bucketName The name of the bucket to create
 * @param isPublic Whether the bucket should be public
 */
export const createBucketIfNotExists = async (
  bucketName: string = STORAGE_BUCKET_NAME,
  isPublic: boolean = true
): Promise<boolean> => {
  try {
    console.log(`[Storage] Checking if bucket ${bucketName} exists...`);
    
    // First check if bucket exists
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`[Storage] Bucket ${bucketName} already exists`);
      return true;
    }
    
    console.log(`[Storage] Creating bucket ${bucketName} (public: ${isPublic})`);
    
    // Create the bucket
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic
    });
    
    if (error) {
      console.error(`[Storage] Error creating bucket ${bucketName}:`, error);
      if (isStorageError(error)) {
        toast({
          title: 'Storage Error',
          description: getSafeErrorMessage(error) || 'Failed to initialize storage',
          variant: 'destructive'
        });
      }
      return false;
    }
    
    console.log(`[Storage] Successfully created bucket ${bucketName}`);
    return true;
  } catch (error) {
    console.error('[Storage] Error in createBucketIfNotExists:', error);
    return false;
  }
};

/**
 * Uploads a file to storage and returns the public URL
 * @param file The file to upload
 * @param userId The user ID for the file path
 * @param prefix Optional path prefix
 * @returns The public URL of the uploaded file or null on error
 */
export const uploadFileAndGetUrl = async (
  file: File,
  userId: string,
  prefix: string = ''
): Promise<string | null> => {
  console.log(`[Storage] Uploading file for user ${userId}`);
  
  try {
    // Ensure the bucket exists
    await createBucketIfNotExists();
    
    // Generate a unique file path
    const fileExt = file.name.split('.').pop() || 'jpg';
    const randomId = Math.random().toString(36).substring(2, 15);
    const filePath = prefix 
      ? `${prefix}/${userId}/${randomId}.${fileExt}`
      : `${userId}/${randomId}.${fileExt}`;
    
    console.log(`[Storage] Uploading to path: ${filePath}`);
    
    // Upload the file with retry logic
    const { data, error } = await fetchWithRetry(() => 
      supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        }),
      { maxRetries: 3, initialDelay: 1000 }
    );
    
    if (error) {
      console.error('[Storage] Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: isStorageError(error) 
          ? getSafeErrorMessage(error) 
          : STORAGE_ERRORS.UPLOAD_FAILED,
        variant: 'destructive'
      });
      return null;
    }
    
    if (!data?.path) {
      console.error('[Storage] Upload succeeded but no path returned');
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .getPublicUrl(data.path);
    
    console.log(`[Storage] File uploaded, public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('[Storage] Unexpected error in uploadFileAndGetUrl:', error);
    toast({
      title: 'Upload Error',
      description: 'An unexpected error occurred while uploading',
      variant: 'destructive'
    });
    return null;
  }
};
