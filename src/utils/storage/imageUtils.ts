
import { isMobileDevice } from '@/utils/fetchUtils';
import { isSafari } from '@/utils/storage/config';

// Helper function to compress images for mobile uploads - improved for Safari
export async function compressImageForUpload(file: File, maxSizeKB = 800): Promise<File> {
  // Skip compression for HEIC files in Safari as it often fails
  if (isSafari() && (file.name.toLowerCase().endsWith('.heic') || file.type.includes('heic'))) {
    console.log('Skipping compression for HEIC file in Safari');
    return file;
  }
  
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
        console.warn('Could not get canvas context, skipping compression');
        resolve(file);
        return;
      }
      
      // Basic drawing with anti-aliasing turned off for Safari compatibility
      ctx.imageSmoothingQuality = 'medium'; // Compatible with Safari
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with higher quality for Safari to avoid over-compression
      let quality = isSafari() ? 0.85 : 0.9;
      let compressedFile: File;
      
      // Try progressively lower qualities until we're under target size
      const tryCompress = () => {
        try {
          // Safari has issues with toDataURL, so we use a safer format
          const imageFormat = 'image/jpeg';
          const dataUrl = canvas.toDataURL(imageFormat, quality);
          
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
          
          // Check if we should recompress with lower quality
          if (currentSizeKB > maxSizeKB && quality > 0.3) {
            // Use smaller quality reduction steps in Safari
            quality -= isSafari() ? 0.05 : 0.1;
            console.log(`Still too large, retrying with quality ${quality}`);
            tryCompress();
          } else if (compressedFile.size >= file.size * 0.95) {
            // If compression didn't reduce size meaningfully, use original
            console.log('Compression ineffective, using original file');
            resolve(file);
          } else {
            console.log(`Final compression: ${(compressedFile.size / 1024).toFixed(2)}KB, original: ${(file.size / 1024).toFixed(2)}KB`);
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
    
    // Override onload and onerror with versions that clean up
    const originalOnload = img.onload;
    img.onload = function() {
      cleanup();
      if (originalOnload) {
        // @ts-ignore - we know originalOnload is a function
        originalOnload.call(this);
      }
    };
    
    const originalOnerror = img.onerror;
    img.onerror = function() {
      cleanup();
      if (originalOnerror) {
        // @ts-ignore - we know originalOnerror is a function
        originalOnerror.call(this);
      }
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
  const isImageType = file.type.startsWith('image/') || 
                     file.name.toLowerCase().match(/\.(jpe?g|png|webp|heic|heif)$/i);
  
  // For mobile devices or Safari, compress images before upload if it's an image file
  if ((isMobileDevice() || isSafari()) && isImageType) {
    try {
      console.log(`${isSafari() ? 'Safari' : 'Mobile'} device detected, compressing image before upload`);
      
      // Skip compression for certain file types on Safari
      if (isSafari() && file.name.toLowerCase().endsWith('.heic')) {
        console.log('Skipping compression for HEIC file on Safari');
        return file;
      }
      
      // Use a more moderate compression for Safari
      const maxSizeKB = isSafari() ? 700 : 800;
      const compressedFile = await compressImageForUpload(file, maxSizeKB);
      
      console.log(`Compressed image from ${file.size} to ${compressedFile.size} bytes (${Math.round(compressedFile.size / file.size * 100)}%)`);
      
      // If compression actually made the file larger (happens sometimes with Safari), use original
      if (compressedFile.size > file.size) {
        console.log('Compression increased file size, using original file');
        return file;
      }
      
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
