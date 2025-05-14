
import { StorageBucketOptions } from '@supabase/storage-js';
import { supabase } from '@/integrations/supabase/client';

// Configuration for storage operations
interface BucketConfig {
  bucketId: string;
  defaultUploadFolder?: string;
}

// Centralized bucket configuration
export const bucketConfig: BucketConfig = {
  bucketId: 'breeding-images',
  defaultUploadFolder: 'uploads'
};

// Error types for storage operations
export type StorageError = {
  message: string;
  status: number;
};

export type StorageResponse<T> = {
  data: T | null;
  error: StorageError | null;
};

/**
 * Creates a storage bucket if it doesn't exist
 */
export async function ensureBucketExists(
  bucketId: string = bucketConfig.bucketId,
  options?: StorageBucketOptions
): Promise<StorageResponse<string>> {
  try {
    // Check if bucket exists
    const { data, error } = await supabase.storage.getBucket(bucketId);
    
    if (error && error.message !== 'Bucket not found') {
      return { data: null, error: { message: error.message, status: error.status || 500 } };
    }
    
    // If bucket doesn't exist, create it
    if (!data) {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(
        bucketId,
        options || {
          public: false,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        }
      );
      
      if (createError) {
        return { 
          data: null, 
          error: { 
            message: createError.message, 
            status: createError.status || 500 
          }
        };
      }
      
      return { data: bucketId, error: null };
    }
    
    return { data: bucketId, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { 
        data: null, 
        error: { message: error.message, status: 500 } 
      };
    }
    
    return { 
      data: null, 
      error: { message: 'Unknown error ensuring bucket exists', status: 500 } 
    };
  }
}

/**
 * Get a list of files in the bucket
 */
export async function listFiles(
  bucketId: string = bucketConfig.bucketId,
  path?: string
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .list(path || bucketConfig.defaultUploadFolder || '');
      
    if (error) {
      return { 
        data: null, 
        error: { message: error.message, status: error.status || 500 } 
      };
    }
    
    return { data, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { 
        data: null, 
        error: { message: error.message, status: 500 } 
      };
    }
    
    return { 
      data: null, 
      error: { message: 'Unknown error listing files', status: 500 } 
    };
  }
}
