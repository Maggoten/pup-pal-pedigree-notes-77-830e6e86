
// Re-exports from storage modules
export * from './config';
// Export operations directly from their source files to avoid ambiguity
export { uploadToStorage } from './operations/upload';
export { removeFromStorage } from './operations/remove';
export { getPublicUrl, retrieveFromStorage, isValidPublicUrl } from './operations/retrieve';
export * from './imageUtils';

// Export mime type constants
export const EXTENDED_MIME_TYPES = {
  JPEG: ['image/jpeg', 'image/jpg'],
  PNG: ['image/png'],
  WEBP: ['image/webp'],
  HEIC: ['image/heic', 'image/heif'],
  // For Safari and iOS which sometimes return generic types
  GENERIC: ['image/image', 'application/octet-stream', 'image']
};

// Explicitly re-export cleanup for direct imports
export { cleanupStorageImage } from './cleanup';
