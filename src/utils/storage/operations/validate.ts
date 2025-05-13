
import { STORAGE_ERRORS } from '../config';

// Define StorageError type locally to avoid dependency on @supabase/storage-js
interface StorageError {
  message: string;
  statusCode?: number;
}

/**
 * Validates a storage object exists
 */
export const validateStorageObject = async (bucket: string, path: string): Promise<boolean> => {
  // Simple validation - in a real implementation, would check against storage
  return !!bucket && !!path;
};

/**
 * Validates file size against maximum allowed size
 */
export const validateFileSize = (fileSize: number, maxSize: number = 10 * 1024 * 1024): boolean => {
  if (fileSize > maxSize) {
    console.warn(`File size (${(fileSize/1024/1024).toFixed(1)}MB) exceeds the maximum allowed size of ${(maxSize/1024/1024).toFixed(1)}MB`);
    return false;
  }
  return true;
};

/**
 * Validates file type against allowed MIME types
 */
export const validateFileType = (fileType: string, allowedTypes: string[]): boolean => {
  const isAllowed = allowedTypes.some(type => 
    fileType === type || 
    fileType.startsWith(`${type.split('/')[0]}/`) // Allow subtypes
  );
  
  if (!isAllowed) {
    console.warn(`File type ${fileType} is not in the allowed types list`);
  }
  
  return isAllowed;
};

/**
 * Validates if a URL is a valid public URL from our storage
 */
export const isValidPublicUrl = (url: string): boolean => {
  if (!url) return false;
  // Basic validation - checks if URL is from our storage domain
  // In a real implementation, would be more specific to your Supabase project
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase') || urlObj.hostname.includes('supabasestorage');
  } catch (e) {
    return false;
  }
};
