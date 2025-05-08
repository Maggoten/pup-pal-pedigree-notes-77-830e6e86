
import { toast } from '@/components/ui/use-toast';
import { EXTENDED_MIME_TYPES } from '@/utils/storage';
import { isSafari } from '@/utils/storage/config';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

export const ALLOWED_FILE_TYPES = [
  ...EXTENDED_MIME_TYPES.JPEG,
  ...EXTENDED_MIME_TYPES.PNG,
  ...EXTENDED_MIME_TYPES.WEBP,
  ...EXTENDED_MIME_TYPES.HEIC,
  // Include generic types that Safari might return
  ...EXTENDED_MIME_TYPES.GENERIC
];

// Dynamically set max file size based on platform - more permissive for Safari
export const getMaxFileSize = () => {
  const platform = getPlatformInfo();
  
  // For iOS devices, be more permissive
  if (platform.iOS) {
    return 6 * 1024 * 1024; // 6MB for iOS
  }
  // For Safari or any mobile device
  else if (platform.safari || platform.mobile) {
    return 5.5 * 1024 * 1024; // 5.5MB for other mobile/Safari
  }
  // For desktop browsers
  else {
    return 5 * 1024 * 1024; // 5MB for desktop
  }
};

// Export a constant for compatibility with existing code
export const MAX_FILE_SIZE = getMaxFileSize();

// Enhanced image type detection with better mobile support
const isImageFile = (file: File): boolean => {
  const platform = getPlatformInfo();
  
  // Get file extension and convert to lowercase
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  
  // More thorough checks for mobile browsers
  const hasValidExtension = imageExtensions.includes(fileExtension);
  const hasValidMimeType = ALLOWED_FILE_TYPES.includes(file.type);
  const isGenericImageType = file.type.startsWith('image/') || file.type === 'application/octet-stream';
  
  // Log detailed validation info
  console.log('Image validation details:', {
    name: file.name,
    extension: fileExtension,
    type: file.type || 'unknown',
    hasValidExtension,
    hasValidMimeType,
    isGenericImageType,
    platform: platform.device,
    safari: platform.safari,
    mobile: platform.mobile
  });
  
  // For mobile Safari, be very permissive
  if (platform.iOS && platform.safari) {
    return hasValidExtension || hasValidMimeType || isGenericImageType;
  }
  
  // For other mobile browsers or Safari, be quite permissive
  if (platform.mobile || platform.safari) {
    return hasValidExtension || hasValidMimeType || isGenericImageType;
  }
  
  // For desktop browsers, be more strict but still allow valid extensions with generic types
  return hasValidMimeType || (hasValidExtension && isGenericImageType);
};

export const validateImageFile = (file: File): boolean => {
  const platform = getPlatformInfo();
  const maxSize = getMaxFileSize();
  
  // Log file details for debugging
  console.log('Validating file:', {
    name: file.name, 
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`, 
    type: file.type || 'unknown',
    platform: platform.device
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
  
  // More lenient size check for different platforms
  const bufferMultiplier = platform.iOS ? 1.1 : 
                           platform.safari ? 1.05 : 1.02;
  const adjustedSize = file.size * bufferMultiplier;
  
  if (adjustedSize > maxSize) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    
    console.log(`File too large: ${fileSizeMB}MB exceeds limit of ${maxSizeMB}MB`);
    
    // Platform-specific error message
    let sizeMessage = `Your image is ${fileSizeMB}MB but the maximum allowed size is ${maxSizeMB}MB.`;
    
    if (platform.iOS) {
      sizeMessage += ' On iOS devices, try using a smaller image or the Photos app to reduce size.';
    } else if (platform.mobile) {
      sizeMessage += ' On mobile, try using a smaller image or a photo resizer app.';
    } else if (platform.safari) {
      sizeMessage += ' Try using a smaller image or switching to Chrome.';
    } else {
      sizeMessage += ' Please choose a smaller image.';
    }
    
    toast({
      title: "File too large",
      description: sizeMessage,
      variant: "destructive"
    });
    return false;
  }

  return true;
};
