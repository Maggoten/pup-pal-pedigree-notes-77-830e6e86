
import { isMobileDevice } from '@/utils/fetchUtils';
import { isSafari } from '@/utils/storage/config';

// Helper function to compress images for mobile uploads - improved for Safari
export async function compressImageForUpload(file: File, maxSizeKB = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      const maxDimension = isSafari() ? 1000 : 1200; // Lower resolution for Safari
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Basic drawing with anti-aliasing turned off for Safari compatibility
      ctx.imageSmoothingQuality = 'medium'; // Compatible with Safari
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with lower quality for Safari
      let quality = isSafari() ? 0.7 : 0.9;
      let compressedFile: File;
      let dataUrl: string;
      
      // Try progressively lower qualities until we're under target size
      const tryCompress = () => {
        try {
          // Safari has issues with toDataURL at high quality, so we use a safer format
          const imageFormat = isSafari() ? 'image/jpeg' : 'image/jpeg';
          dataUrl = canvas.toDataURL(imageFormat, quality);
          
          const binaryData = atob(dataUrl.split(',')[1]);
          const array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            array[i] = binaryData.charCodeAt(i);
          }
          
          // Create a more compatible blob for Safari
          const blob = new Blob([array], { type: 'image/jpeg' });
          compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { 
            type: 'image/jpeg',
            lastModified: new Date().getTime()
          });
          
          const currentSizeKB = compressedFile.size / 1024;
          console.log(`Compressed to ${currentSizeKB.toFixed(2)}KB with quality ${quality}`);
          
          if (currentSizeKB > maxSizeKB && quality > 0.2) {
            quality -= 0.1;
            console.log(`Still too large, retrying with quality ${quality}`);
            tryCompress();
          } else {
            resolve(compressedFile);
          }
        } catch (error) {
          console.error('Error during compression:', error);
          // Fallback to original file if compression fails
          console.log('Falling back to original file due to compression error');
          resolve(file);
        }
      };
      
      tryCompress();
    };
    
    img.onerror = () => {
      console.error('Failed to load image for compression');
      // Return original file if we can't load it for compression
      resolve(file);
    };
    
    // Create object URL with revocation to prevent memory leaks
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Cleanup object URL after loading or on error
    const cleanup = () => URL.revokeObjectURL(objectUrl);
    img.onload = () => {
      cleanup();
      img.onload = null;
    };
    img.onerror = () => {
      cleanup();
      console.error('Failed to load image for compression');
      resolve(file);
    };
  });
}

// Image prefetch function to help with mobile loading - improved for Safari
export const prefetchImage = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Add cache busting for Safari
    const cacheBustUrl = isSafari() ? 
      `${url}${url.includes('?') ? '&' : '?'}cacheBust=${new Date().getTime()}` : 
      url;
    
    const img = new Image();
    
    // Set a timeout for Safari which sometimes doesn't fire events
    const safariTimeout = isSafari() ? 
      setTimeout(() => {
        console.log('Safari image prefetch timed out, considering successful');
        resolve();
      }, 5000) : null;
    
    img.onload = () => {
      if (safariTimeout) clearTimeout(safariTimeout);
      resolve();
    };
    
    img.onerror = () => {
      if (safariTimeout) clearTimeout(safariTimeout);
      console.warn(`Failed to prefetch image: ${url}`);
      // Resolve anyway to prevent blocking in Safari
      resolve();
    };
    
    img.src = cacheBustUrl;
  });
};

// Function to handle image compression based on device type - improved for Safari
export const processImageForUpload = async (file: File): Promise<File> => {
  // For mobile devices or Safari, compress images before upload if it's an image file
  if ((isMobileDevice() || isSafari()) && file.type.startsWith('image/')) {
    try {
      console.log(`${isSafari() ? 'Safari' : 'Mobile'} device detected, compressing image before upload`);
      
      // Use a more aggressive compression for Safari
      const maxSizeKB = isSafari() ? 600 : 800;
      const compressedFile = await compressImageForUpload(file, maxSizeKB);
      
      console.log(`Compressed image from ${file.size} to ${compressedFile.size} bytes`);
      return compressedFile;
    } catch (compressError) {
      console.warn('Image compression failed, using original file:', compressError);
      return file;
    }
  }
  
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
