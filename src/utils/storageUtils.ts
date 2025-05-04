
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StorageError } from '@supabase/storage-js';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

// We'll now use a constant for bucket name that's consistent throughout the app
export const BUCKET_NAME = 'dog-photos';

// Check if bucket exists and is accessible with retries
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Storage bucket check failed: No active session', sessionError);
      return false;
    }

    console.log('Checking if bucket exists:', BUCKET_NAME);
    
    try {
      // Using our retry utility for more reliable bucket checking
      const result = await fetchWithRetry(
        () => supabase.storage.from(BUCKET_NAME).list('', { limit: 1 }),
        {
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      if (result.error) {
        console.error('Error checking bucket existence:', result.error);
        return false;
      }
      
      console.log('Bucket exists, can list files:', result.data);
      return true;
    } catch (listError) {
      console.error('Error or timeout when listing bucket contents:', listError);
      return false;
    }
  } catch (err) {
    console.error('Error in bucket verification:', err);
    return false;
  }
};

// Improved upload function with retry logic and progress reporting
export const uploadToStorage = async (
  fileName: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<{data: any, error: StorageError | null}> => {
  try {
    // First verify auth session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session for upload');
    }
    
    // For mobile devices, compress images before upload if it's an image file
    let fileToUpload = file;
    if (isMobileDevice() && file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImageForUpload(file);
        console.log(`Compressed image from ${file.size} to ${fileToUpload.size} bytes`);
      } catch (compressError) {
        console.warn('Image compression failed, using original file:', compressError);
      }
    }
    
    // Upload with retry logic
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        }),
      { 
        maxRetries: 2,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`Retrying upload attempt ${attempt}`);
          if (onProgress) onProgress(-1); // Signal retry to UI
        }
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error: new StorageError('Upload failed', 500) };
  }
};

// Helper function to compress images for mobile uploads
async function compressImageForUpload(file: File, maxSizeKB = 500): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      const maxDimension = 1200; // Max width or height
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with high quality
      let quality = 0.9;
      let compressedFile: File;
      let dataUrl: string;
      
      // Try progressively lower qualities until we're under target size
      const tryCompress = () => {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        const binaryData = atob(dataUrl.split(',')[1]);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([array], { type: 'image/jpeg' });
        compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
        
        const currentSizeKB = compressedFile.size / 1024;
        
        if (currentSizeKB > maxSizeKB && quality > 0.1) {
          quality -= 0.1;
          tryCompress();
        } else {
          resolve(compressedFile);
        }
      };
      
      tryCompress();
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
}

// Get public URL for a file
export const getPublicUrl = (fileName: string) => {
  return supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
};

// Remove file from storage with retries
export const removeFromStorage = async (storagePath: string) => {
  try {
    // Verify session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No active session for deletion');
    }
    
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { maxRetries: 1, initialDelay: 1000 }
    );
  } catch (error) {
    console.error('Remove from storage error:', error);
    throw error;
  }
};

// Image prefetch function to help with mobile loading
export const prefetchImage = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Improved cleanup with better error handling
export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: StorageCleanupOptions) => {
  if (!oldImageUrl || !oldImageUrl.includes(BUCKET_NAME)) {
    console.log('No valid image URL to cleanup:', oldImageUrl);
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Storage cleanup failed: No active session');
      return;
    }
    
    // Check if other dogs are using the same image before deleting
    const { data: dogsUsingImage, error: searchError } = await supabase
      .from('dogs')
      .select('id')
      .eq('image_url', oldImageUrl)
      .eq('owner_id', userId);
    
    // If excludeDogId is provided, filter it out from the results
    const otherDogsUsingImage = dogsUsingImage ? 
      dogsUsingImage.filter(dog => dog.id !== excludeDogId) : 
      [];

    if (searchError) {
      console.error('Error checking for image usage:', searchError);
      return;
    }

    if (otherDogsUsingImage && otherDogsUsingImage.length > 0) {
      console.log('Image is still in use by other dogs, skipping deletion', otherDogsUsingImage);
      return;
    }

    // Check if bucket exists and is accessible
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      console.log('Skipping image deletion due to bucket access issues');
      return; // Just return without throwing, let the dog deletion complete
    }
    
    console.log(`Bucket "${BUCKET_NAME}" exists and is accessible, proceeding with deletion`);

    // Extract the storage path from the URL
    const urlParts = oldImageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.error('Could not find bucket name in URL:', oldImageUrl);
      return;
    }
    
    const storagePath = urlParts
      .slice(bucketIndex + 1)
      .join('/');

    console.log('Deleting unused image:', storagePath);
    
    // Use fetchWithRetry for deletion
    await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { maxRetries: 1, initialDelay: 1000 }
    );
  
    console.log('Successfully deleted unused image');
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred while cleaning up storage";

    console.error('Cleanup error:', {
      error,
      message: errorMessage
    });
    
    // Don't throw, just log the error and allow the dog deletion to complete
  }
};
