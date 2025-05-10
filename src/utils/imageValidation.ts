
import { SUPPORTED_IMAGE_EXTENSIONS } from '@/utils/storage';
import { EXTENDED_MIME_TYPES } from '@/utils/storage';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

// Export the max file size constant
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates if a file is an image based on its MIME type or extension.
 * @param file The file to validate.
 * @returns True if the file is an image, false otherwise.
 */
export const isImageFile = (file: File): boolean => {
  if (!file) {
    return false;
  }

  const platform = getPlatformInfo();
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // Check if the file extension is a supported image extension
  if (SUPPORTED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(`.${ext}`))) {
    return true;
  }

  // Check if the MIME type is a supported image MIME type
  if (Object.values(EXTENDED_MIME_TYPES).flat().some(type => mimeType === type)) {
    return true;
  }

  // Special handling for Safari
  if (platform.safari) {
    // Safari might not always provide a valid MIME type, so we rely on the extension
    if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
      return true;
    }
    // Safari sometimes uses generic MIME types for images
    if (EXTENDED_MIME_TYPES.GENERIC.includes(mimeType)) {
      return true;
    }
  }

  return false;
};
