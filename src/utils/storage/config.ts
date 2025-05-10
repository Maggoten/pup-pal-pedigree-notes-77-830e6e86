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
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file.',
  COMPRESSION_ERROR: 'Failed to compress image. Trying direct upload.',
  MOBILE_UPLOAD_ERROR: 'Mobile upload issue. Try using a smaller image (under 2MB).',
  CANVAS_ERROR: 'Browser could not process this image. Try a different image format.'
};

// Enhanced error interfaces
export interface StorageErrorDetails {
  message?: string;
  status?: number;
  statusCode?: number;
  details?: string;
}

export interface SupabaseStorageError {
  error: string | Error;
  status?: number;
  details?: string;
}

export interface ApiErrorResponse {
  error: string | Error | unknown;
  status?: number;
  statusCode?: number;
  message?: string;
  details?: string;
}

// Type guard for checking if an object is a storage error
export function isStorageError(error: unknown): error is StorageErrorDetails {
  return typeof error === 'object' && 
         error !== null && 
         ('message' in error || 'status' in error || 'details' in error);
}

// Type guard for checking if an object is a Supabase storage error
export function isSupabaseStorageError(error: unknown): error is SupabaseStorageError {
  return typeof error === 'object' && 
         error !== null && 
         'error' in error;
}

// Type guard for API error responses
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && 
         error !== null && 
         'error' in error;
}

// Enhanced Safari detection
export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    (userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('android')) ||
    // iPad on iOS 13+ detection
    (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1 && !userAgent.includes('chrome'))
  );
};

// Mobile-aware timeouts
export const getStorageTimeout = (): number => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|ipod|android/i.test(userAgent);
  
  if (isSafari() && isMobile) {
    return 60000; // 60 seconds for mobile Safari
  } else if (isSafari()) {
    return 45000; // 45 seconds for desktop Safari
  } else if (isMobile) {
    return 50000; // 50 seconds for other mobile browsers
  } else {
    return 30000; // 30 seconds for desktop browsers
  }
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

// Safe error extraction utility
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (isSupabaseStorageError(error)) {
    return typeof error.error === 'string' ? error.error : error.error.message;
  } else if (isStorageError(error)) {
    return error.message || 'Unknown storage error';
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  } else {
    return 'Unknown error occurred';
  }
};
