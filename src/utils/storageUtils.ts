
/**
 * @deprecated This file is deprecated. 
 * Please import from '@/utils/storage' instead.
 * 
 * Example:
 * import { uploadToStorage, getPublicUrl } from '@/utils/storage';
 */

// Direct re-exports from the storage module
export * from '@/utils/storage';

// Re-export cleanup function for backward compatibility
export { cleanupStorageImage } from '@/utils/storage/cleanup';
