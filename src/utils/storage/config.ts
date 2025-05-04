
// Core configuration for storage operations
export const BUCKET_NAME = 'Dog Photos';

// Common error messages
export const STORAGE_ERRORS = {
  NO_SESSION: 'No active session. User authentication is required.',
  BUCKET_NOT_FOUND: (bucket: string) => `Storage bucket "${bucket}" does not exist or is not accessible`,
  UPLOAD_FAILED: 'Upload failed',
  DOWNLOAD_FAILED: 'Download failed',
  REMOVE_FAILED: 'Failed to remove file',
};
