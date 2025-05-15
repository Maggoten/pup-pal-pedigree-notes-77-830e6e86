
import { isMobileDevice } from '@/utils/fetchUtils';
import { isSafari } from '@/utils/storage/config';
import { getPlatformInfo } from './mobileUpload';

// Improved image prefetch function with better mobile support
export const prefetchImage = async (url: string): Promise<void> => {
  return new Promise((resolve) => {
    const platform = getPlatformInfo();
    
    // Add cache busting for Safari/mobile
    const cacheBustUrl = (platform.safari || platform.mobile) ? 
      `${url}${url.includes('?') ? '&' : '?'}cacheBust=${new Date().getTime()}` : 
      url;
    
    const img = new Image();
    
    // Set a timeout for Safari which sometimes doesn't fire events
    const safariTimeout = platform.safari ? 
      setTimeout(() => {
        console.log('Safari image prefetch timed out, considering successful');
        resolve();
      }, 5000) : null;
    
    img.onload = () => {
      if (safariTimeout) clearTimeout(safariTimeout);
      resolve();
    };
    
    img.onerror = (err) => {
      if (safariTimeout) clearTimeout(safariTimeout);
      console.warn(`Failed to prefetch image: ${url}`, err);
      resolve();
    };
    
    img.src = cacheBustUrl;
    
    // Set a global timeout in case nothing fires
    setTimeout(() => {
      resolve();
    }, 8000);
  });
};

// Function to handle image compression based on device type
export const processImageForUpload = async (file: File): Promise<File> => {
  const platform = getPlatformInfo();
  const isImageType = file.type.startsWith('image/') || 
                     file.name.toLowerCase().match(/\.(jpe?g|png|webp|heic|heif)$/i);
  
  // Log initial file details
  console.log(`Processing image for upload:`, {
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)}KB`,
    type: file.type || 'unknown',
    platform: platform.device,
    safari: platform.safari,
    mobile: platform.mobile
  });

  // Skip compression in certain cases
  if (!isImageType) {
    console.log('Not an image file, skipping compression');
    return file;
  }
  
  // Special handling for iOS HEIC files
  if (platform.ios && file.name.toLowerCase().match(/\.(heic|heif)$/)) {
    console.log('iOS HEIC/HEIF file detected, using direct upload');
    return file; // Return the original file instead of using directUpload
  }
  
  try {
    // For very small files, skip compression
    if (file.size < 500 * 1024) { // < 500KB
      console.log('File already small enough, skipping compression');
      return file;
    }
    
    // For mobile or Safari, use basic compression
    if (platform.mobile || platform.safari) {
      console.log(`${platform.device} detected, using enhanced image compression`);
      return compressImage(file);
    }
    
    // For desktop browsers with larger files, use moderate compression
    if (file.size > 3 * 1024 * 1024) { // > 3MB
      console.log('Large file on desktop, using standard compression');
      return compressImage(file);
    }
    
    // For smaller files on desktop, don't compress
    return file;
  } catch (error) {
    console.warn('Image compression failed, using original file:', error);
    return file;
  }
};

// Simple placeholder compression function
const compressImage = async (file: File): Promise<File> => {
  console.log('Basic image compression called for:', file.name);
  // In a real implementation, this would use a library like browser-image-compression
  // For now, we'll just return the original file
  return file;
};

// Helper function for Safari-compatible file handling
export const createSafariCompatibleFile = (blob: Blob, filename: string, mimeType: string): File => {
  try {
    return new File([blob], filename, { type: mimeType });
  } catch (error) {
    console.warn('Error creating File object in Safari, using blob with properties instead');
    // In some Safari versions, the File constructor might not work as expected
    // So we create a Blob with File-like properties
    const file = blob as any;
    file.name = filename;
    file.lastModified = new Date().getTime();
    return file as File;
  }
};
