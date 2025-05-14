export const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'public';

// Image processing constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_WIDTH = 1024;
export const MAX_HEIGHT = 1024;
export const COMPRESSION_QUALITY = 0.7;

// Mobile upload settings
export const MOBILE_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB for mobile
export const MOBILE_COMPRESSION_QUALITY = 0.6;

// Storage error constants
export const STORAGE_ERROR_CODES = {
  NO_SESSION: 'No active authentication session found',
  BUCKET_NOT_FOUND: (bucket: string) => `Storage bucket "${bucket}" not found or inaccessible`,
  UPLOAD_FAILED: 'Failed to upload file to storage',
  DOWNLOAD_FAILED: 'Failed to download file from storage',
  REMOVE_FAILED: 'Failed to remove file from storage',
  SAFARI_STORAGE_ERROR: 'Safari browser storage issue detected',
  RETRY_EXCEEDED: 'Maximum retry attempts exceeded',
  PROCESS_IMAGE_FAILED: 'Failed to process image for upload',
  FILE_TOO_LARGE: 'File exceeds maximum allowed size',
  INVALID_FILE_TYPE: 'File type not supported',
  CANVAS_ERROR: 'Error processing image in canvas',
  GET_URL_FAILED: 'Failed to get public URL for file'
};

// Type definitions for storage errors
export interface StorageErrorDetails {
  message: string;
  statusCode?: number;
  details?: string;
}

export interface SupabaseStorageError {
  error: string | StorageErrorDetails;
}

// Type guards for error identification
export const isStorageError = (obj: unknown): obj is { message: string } => {
  return typeof obj === 'object' &&
         obj !== null &&
         'message' in obj &&
         typeof (obj as any).message === 'string';
};

export const isSupabaseStorageError = (obj: unknown): obj is SupabaseStorageError => {
  return typeof obj === 'object' &&
         obj !== null &&
         'error' in obj &&
         (typeof (obj as any).error === 'string' || 
          typeof (obj as any).error === 'object');
};

// Helper function to safely get error message from any error type
export const getSafeErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') return error;
  
  if (isSupabaseStorageError(error)) {
    if (typeof error.error === 'string') return error.error;
    return error.error.message || 'Storage error occurred';
  }
  
  if (isStorageError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return 'Unexpected error occurred';
};
