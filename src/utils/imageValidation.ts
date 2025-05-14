
import { toast } from '@/components/ui/use-toast';
import { EXTENDED_MIME_TYPES } from '@/utils/storage';
import { isSafari } from '@/utils/storage/config';

// Import getPlatformInfo directly from mobileUpload.ts
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

// Define allowed file types based on extended MIME types
export const ALLOWED_FILE_TYPES = [
  ...EXTENDED_MIME_TYPES.JPEG,
  ...EXTENDED_MIME_TYPES.PNG,
  ...EXTENDED_MIME_TYPES.WEBP,
  ...EXTENDED_MIME_TYPES.HEIC,
  // Include generic types that Safari might return
  ...EXTENDED_MIME_TYPES.GENERIC
];

// Get maximum file size based on platform detection
export const getMaxFileSize = () => {
  const platform = getPlatformInfo();
  
  // For iOS devices, be more permissive
  if (platform.iOS) {
    return 8 * 1024 * 1024; // 8MB for iOS - increased from 6MB
  }
  // For Safari or any mobile device
  else if (platform.safari || platform.mobile) {
    return 7 * 1024 * 1024; // 7MB for other mobile/Safari - increased from 5.5MB
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
  console.log('Image type validation details:', {
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
    console.log('Using very permissive iOS Safari image type validation');
    return hasValidExtension || hasValidMimeType || isGenericImageType || fileExtension.length > 0;
  }
  
  // For other mobile browsers or Safari, be quite permissive
  if (platform.mobile || platform.safari) {
    console.log('Using permissive mobile image type validation');
    return hasValidExtension || hasValidMimeType || isGenericImageType;
  }
  
  // For desktop browsers, be more strict but still allow valid extensions with generic types
  console.log('Using standard desktop image type validation');
  return hasValidMimeType || (hasValidExtension && isGenericImageType);
};

export const validateImageFile = (file: File): boolean => {
  const platform = getPlatformInfo();
  const maxSize = getMaxFileSize();
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
  
  // Log file details for debugging
  console.log('Validating image file:', {
    name: file.name, 
    size: `${fileSizeMB}MB (${file.size} bytes)`, 
    type: file.type || 'unknown',
    maxSize: `${(maxSize / 1024 / 1024).toFixed(2)}MB (${maxSize} bytes)`,
    platform: platform.device,
    safari: platform.safari,
    mobile: platform.mobile
  });
  
  // First check file type
  console.log('Starting MIME type validation');
  if (!isImageFile(file)) {
    console.log('MIME TYPE VALIDATION FAILED:', {
      filename: file.name,
      type: file.type || 'unknown'
    });
    
    // More specific error message showing the file type
    toast({
      title: "Invalid file type",
      description: `The file "${file.name}" (${file.type || 'unknown type'}) is not supported. Please use JPEG, PNG, WebP, or HEIC format.`,
      variant: "destructive"
    });
    return false;
  }
  
  console.log('MIME type validation passed, proceeding to size check');
  
  // For mobile, be extremely permissive about file sizes
  if (platform.mobile) {
    // Skip buffer multiplier entirely on mobile - new approach!
    const shouldSkipSizeCheck = platform.iOS && file.size < 5 * 1024 * 1024;
    
    // Skip size check completely for small iOS files
    if (shouldSkipSizeCheck) {
      console.log('Size validation BYPASSED for small iOS file');
      return true;
    }
  }
  
  // Reduced buffer multipliers
  const bufferMultiplier = platform.iOS ? 1.05 : 
                           platform.safari ? 1.03 : 1.01;
  
  // For small files on mobile (under 2MB), skip buffer multiplier completely
  const shouldApplyBuffer = !(platform.mobile && file.size < 2 * 1024 * 1024);
  const adjustedSize = shouldApplyBuffer ? file.size * bufferMultiplier : file.size;
  
  console.log('Size validation details:', {
    originalSize: file.size,
    bufferMultiplier: shouldApplyBuffer ? bufferMultiplier : 'none (small mobile file)',
    adjustedSize,
    maxAllowedSize: maxSize,
    willPass: adjustedSize <= maxSize
  });
  
  if (adjustedSize > maxSize) {
    console.log('SIZE VALIDATION FAILED:', {
      originalSize: `${fileSizeMB}MB`,
      adjustedSize: `${(adjustedSize / 1024 / 1024).toFixed(2)}MB`,
      maxSize: `${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      difference: `${((adjustedSize - maxSize) / 1024 / 1024).toFixed(2)}MB over limit`
    });
    
    // Platform-specific error message
    let sizeMessage = `Your image is ${fileSizeMB}MB but the maximum allowed size is ${(maxSize / 1024 / 1024).toFixed(1)}MB.`;
    
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

  console.log('Image validation PASSED, proceeding with upload');
  return true;
};
