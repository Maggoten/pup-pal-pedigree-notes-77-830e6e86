import { toast } from '@/components/ui/use-toast';
import { EXTENDED_MIME_TYPES } from '@/utils/storage';
import { isSafari } from '@/utils/storage/config';

export const ALLOWED_FILE_TYPES = [
  ...EXTENDED_MIME_TYPES.JPEG,
  ...EXTENDED_MIME_TYPES.PNG,
  ...EXTENDED_MIME_TYPES.WEBP,
  ...EXTENDED_MIME_TYPES.HEIC,
  // Include generic types that Safari might return
  ...EXTENDED_MIME_TYPES.GENERIC
];

// Increase max file size to 6MB for Safari, keep 5MB for others
export const MAX_FILE_SIZE = isSafari() ? 6 * 1024 * 1024 : 5 * 1024 * 1024; 

// Improved file type detection that works better with Safari
const isImageFile = (file: File): boolean => {
  // Get file extension and convert to lowercase
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  
  // More thorough checks for Safari's inconsistent type reporting
  const hasValidExtension = imageExtensions.includes(fileExtension);
  const hasValidMimeType = ALLOWED_FILE_TYPES.includes(file.type);
  const isGenericImageType = file.type.startsWith('image/');
  
  // For Safari, we'll be more permissive with file types
  if (isSafari()) {
    return hasValidExtension || hasValidMimeType || isGenericImageType;
  }
  
  // For other browsers, we'll be more strict
  return hasValidMimeType || (hasValidExtension && isGenericImageType);
};

export const validateImageFile = (file: File) => {
  // Log file details for debugging
  console.log('Validating file:', {
    name: file.name, 
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`, 
    type: file.type || 'unknown',
    browser: isSafari() ? 'Safari' : 'Other'
  });
  
  if (!isImageFile(file)) {
    console.log('File validation failed, type:', file.type);
    // More specific error message showing the file type
    toast({
      title: "Invalid file type",
      description: `The file "${file.name}" (${file.type || 'unknown type'}) is not supported. Please use JPEG, PNG, WebP, or HEIC format.`,
      variant: "destructive"
    });
    return false;
  }
  
  // More lenient size check accounting for Safari's different calculations
  // +10% buffer for Safari, 5% for others
  const bufferMultiplier = isSafari() ? 1.1 : 1.05;
  const adjustedSize = file.size * bufferMultiplier;
  
  if (adjustedSize > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(1);
    
    console.log(`File too large: ${fileSizeMB}MB exceeds limit of ${maxSizeMB}MB`);
    
    // More helpful error message showing actual file size
    toast({
      title: "File too large",
      description: `Your image is ${fileSizeMB}MB but the maximum allowed size is ${maxSizeMB}MB. ${isSafari() ? 'Try using a smaller image or switching to Chrome.' : 'Please choose a smaller image.'}`,
      variant: "destructive"
    });
    return false;
  }

  return true;
};
