
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
  HEIC: ['image/heic', 'image/heif'],
  // Safari sometimes uses these generic types
  GENERIC: ['application/octet-stream', 'image', 'image/generic'],
};
