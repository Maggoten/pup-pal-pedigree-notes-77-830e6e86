
/**
 * Error messages for storage operations
 */
export const StorageErrors = {
  NO_SESSION: 'No active session found. Please log in first.',
  BUCKET_NOT_FOUND: (bucket: string) => `Bucket '${bucket}' not found. Please check bucket name.`,
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  DOWNLOAD_FAILED: 'Failed to download file. Please try again.',
  REMOVE_FAILED: 'Failed to remove file. Please try again.',
  SAFARI_STORAGE_ERROR: 'Safari storage access denied. Please enable cross-site tracking in privacy settings.',
  RETRY_EXCEEDED: 'Maximum retry attempts exceeded.',
  TIMEOUT: 'Operation timed out. Please check your internet connection.',
  INVALID_FILE: 'Invalid file format or empty file.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  NOT_FOUND: 'File not found.',
  GET_URL_FAILED: 'Failed to get file URL. Please try again.',
  CANVAS_ERROR: 'Error processing image. Please try with another image.',
};
