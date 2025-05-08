
// Core configuration for storage operations
export const BUCKET_NAME = 'dog-photos';

// Common error messages
export const STORAGE_ERRORS = {
  NO_SESSION: 'No active session. User authentication is required.',
  BUCKET_NOT_FOUND: (bucket: string) => `Storage bucket "${bucket}" does not exist or is not accessible`,
  UPLOAD_FAILED: 'Upload failed',
  DOWNLOAD_FAILED: 'Download failed',
  REMOVE_FAILED: 'Failed to remove file',
  SAFARI_STORAGE_ERROR: 'Safari storage access error, trying alternative method',
  RETRY_EXCEEDED: 'Maximum retry attempts exceeded',
  FILE_TOO_LARGE: (size: number) => `File size (${(size/1024/1024).toFixed(1)}MB) exceeds the maximum allowed`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file.'
};

// Safari detection utility
export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  return userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Android');
};

// Increase timeouts for Safari browsers
export const getStorageTimeout = (): number => {
  return isSafari() ? 45000 : 30000; // 45 seconds for Safari, 30 for others
};

// Extended MIME types Safari might use
export const EXTENDED_MIME_TYPES = {
  JPEG: ['image/jpeg', 'image/jpg'],
  PNG: ['image/png'],
  WEBP: ['image/webp'],
  HEIC: ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'],
  // Safari sometimes uses these generic types
  GENERIC: [
    'application/octet-stream', 
    'image', 
    'image/generic', 
    'binary/octet-stream',
    ''  // Empty string is sometimes returned by Safari
  ],
};

// Get supported image extensions
export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

// Check if a file is an image based on extension
export const isImageByExtension = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_IMAGE_EXTENSIONS.includes(extension);
};
