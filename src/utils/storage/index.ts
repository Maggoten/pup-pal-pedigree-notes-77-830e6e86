
// Re-exports from storage modules
export * from './config';
export * from './operations';
export * from './operations/index';
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
