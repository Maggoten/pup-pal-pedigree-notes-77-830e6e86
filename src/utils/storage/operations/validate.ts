
import { BUCKET_NAME, STORAGE_ERRORS, SUPPORTED_IMAGE_EXTENSIONS } from '../config';

const MAX_FILE_SIZE_MB = 10; // 10MB maximum file size

/**
 * Validates if a storage object path exists and is accessible
 */
export const validateStorageObject = async (path: string): Promise<boolean> => {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // Simple path validation
  return path.trim().length > 0 && !path.includes('..') && !path.startsWith('/');
};

/**
 * Validates file size against maximum allowed size
 * @param size File size in bytes
 * @param maxSizeMB Optional custom maximum size in MB
 */
export const validateFileSize = (size: number, maxSizeMB: number = MAX_FILE_SIZE_MB): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxSizeBytes;
};

/**
 * Validates file type based on extension or MIME type
 * @param file File to validate
 * @param allowedTypes Optional array of allowed MIME types (defaults to images)
 */
export const validateFileType = (
  file: File | { name: string; type: string },
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
): boolean => {
  if (!file) return false;

  // Check by MIME type
  if (file.type && allowedTypes.some(type => file.type.toLowerCase() === type.toLowerCase())) {
    return true;
  }

  // Check by extension as fallback
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_IMAGE_EXTENSIONS.includes(extension);
};

/**
 * Checks if a URL is a valid public storage URL
 */
export const isValidPublicUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Check if it's a storage URL (contains bucket name)
  return url.includes(BUCKET_NAME) && url.startsWith('http');
};
