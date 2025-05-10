
// Main entry point for storage utilities - with explicit exports to avoid conflicts
export { 
  BUCKET_NAME, 
  STORAGE_ERRORS,
  isSafari 
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
  deleteStorageObject
} from './operations/remove';

// Export from retrieve operations
export {
  getPublicUrl,
  listStorageObjects
} from './operations/retrieve';

// Export validation utilities
export {
  validateStorageObject,
  validateFileSize,
  validateFileType
} from './operations/validate';

// Export from imageUtils
export {
  prefetchImage,
  processImageForUpload,
  createSafariCompatibleFile,
  compressImage,
  formatStorageError,
  createStorageError,
  hasError,
  safeGetErrorProperty,
  getStorageTimeout
} from './imageUtils';

// Export from cleanup
export {
  cleanupOrphanedUploads,
  scheduleCleanup
} from './cleanup';
