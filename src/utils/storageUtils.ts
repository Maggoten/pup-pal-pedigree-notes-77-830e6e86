
/**
 * @deprecated This file is deprecated. 
 * Please import from '@/utils/storage' instead.
 * 
 * Example:
 * import { uploadToStorage, getPublicUrl } from '@/utils/storage';
 */

export * from '@/utils/storage';

// Re-export cleanup specifically since it's imported directly from storageUtils
export { cleanupStorageImage } from '@/utils/storage/cleanup';
