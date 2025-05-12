
// Main entry point for storage utilities with explicit exports to avoid conflicts

// Export configuration
export { 
  BUCKET_NAME, 
  STORAGE_ERRORS,
  isSafari,
  EXTENDED_MIME_TYPES,
  SUPPORTED_IMAGE_EXTENSIONS,
  isImageByExtension,
  getSafeErrorMessage
} from './config';

// Export from mobileUpload
export { 
  safeImageCompression,
  directUpload, 
  getPlatformInfo 
} from './mobileUpload';

// Export from bucket operations
export {
  checkBucketExists,
  createBucketIfNotExists
} from './core/bucket';

// Export from session operations
export {
  verifyStorageSession
} from './core/session';

// Export from error handling
export {
  formatStorageError,
  createStorageError,
  hasError,
  safeGetErrorProperty,
  handleStorageError
} from './core/errors';

// Export from upload operations
export {
  uploadImage,
  uploadToStorage
} from './operations/upload';

// Export from remove operations
export {
  removeImage,
  removeFromStorage,
  deleteStorageObject
} from './operations/remove';

// Export from retrieve operations
export {
  getPublicUrl
} from './operations/retrieve';

// Export validation utilities
export {
  validateStorageObject,
  validateFileSize,
  validateFileType,
  isValidPublicUrl
} from './operations/validate';

// Export from imageUtils
export {
  prefetchImage,
  processImageForUpload,
  createSafariCompatibleFile,
  compressImage
} from './imageUtils';

// Export from cleanup
export {
  cleanupStorageImage,
  cleanupOrphanedUploads,
  scheduleCleanup
} from './cleanup';
