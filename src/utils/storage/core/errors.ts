
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

/**
 * Format a storage error message from different error types
 */
export const formatStorageError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  } else {
    return 'Unknown storage error occurred';
  }
};

/**
 * Create a standardized storage error object
 */
export const createStorageError = (message: string, details?: any): Error => {
  const error = new Error(message);
  if (details) {
    (error as any).details = details;
  }
  return error;
};

/**
 * Check if an object has error properties
 */
export const hasError = (obj: any): boolean => {
  return obj && (
    obj instanceof Error ||
    obj.error ||
    obj.message ||
    obj.errorMessage ||
    obj.statusCode >= 400
  );
};

/**
 * Safely get a property from an error object
 */
export const safeGetErrorProperty = <T>(
  error: unknown,
  property: string,
  defaultValue: T
): T => {
  if (!error || typeof error !== 'object') {
    return defaultValue;
  }
  
  return (error as any)[property] || defaultValue;
};

/**
 * Handle storage errors with consistent formatting
 */
export const handleStorageError = (
  error: unknown, 
  defaultMessage: string = 'Storage operation failed'
): string => {
  console.error('Storage error:', error);
  return formatStorageError(error) || defaultMessage;
};
