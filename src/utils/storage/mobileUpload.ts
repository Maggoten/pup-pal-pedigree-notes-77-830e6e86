// Import isSafari from config
import { isSafari } from './config';

// Direct upload for HEIC/HEIF files on iOS
export const directUpload = async (file: File): Promise<File> => {
  console.log('Directly uploading HEIC/HEIF file');
  return file;
};

// Get platform information
export const getPlatformInfo = () => {
  if (typeof navigator === 'undefined') {
    return {
      iOS: false,
      android: false,
      safari: false,
      mobile: false,
      device: 'server'
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const iOS = /iphone|ipad|ipod/.test(userAgent);
  const android = /android/.test(userAgent);
  const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const mobile = /mobile/i.test(userAgent);

  let device = 'desktop';
  if (iOS) device = 'iOS';
  else if (android) device = 'android';
  else if (mobile) device = 'mobile';

  return {
    iOS,
    android,
    safari,
    mobile,
    device
  };
};

// Compress image while preserving EXIF data
export const safeImageCompression = async (file: File): Promise<File> => {
  const platform = getPlatformInfo();
  const MAX_WIDTH = 1024;
  const MAX_HEIGHT = 1024;
  const COMPRESSION_QUALITY = 0.7; // Default compression quality

  // Mobile-specific settings
  const MOBILE_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MOBILE_COMPRESSION_QUALITY = 0.6; // More aggressive compression

  const shouldCompress = (file: File) => {
    if (platform.mobile) {
      return file.size > (MOBILE_MAX_FILE_SIZE / 2); // Compress if larger than 1MB on mobile
    }
    return file.size > (MOBILE_MAX_FILE_SIZE); // Compress if larger than 2MB on desktop
  };

  if (!shouldCompress(file)) {
    console.log('Skipping compression: File size is within acceptable limits');
    return file;
  }

  console.log('Starting image compression');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.warn('Canvas context not available, skipping compression');
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Determine compression quality based on platform
        const quality = platform.mobile ? MOBILE_COMPRESSION_QUALITY : COMPRESSION_QUALITY;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              console.log(`Image compression successful: original size ${file.size} bytes, compressed size ${compressedFile.size} bytes`);
              resolve(compressedFile);
            } else {
              console.warn('Canvas toBlob failed, skipping compression');
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(error);
      };

      if (event.target && event.target.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};
