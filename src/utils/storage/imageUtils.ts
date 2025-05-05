
import { isMobileDevice } from '@/utils/fetchUtils';

// Helper function to compress images for mobile uploads
export async function compressImageForUpload(file: File, maxSizeKB = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      const maxDimension = 1200; // Max width or height
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
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with high quality
      let quality = 0.9;
      let compressedFile: File;
      let dataUrl: string;
      
      // Try progressively lower qualities until we're under target size
      const tryCompress = () => {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        const binaryData = atob(dataUrl.split(',')[1]);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([array], { type: 'image/jpeg' });
        compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
        
        const currentSizeKB = compressedFile.size / 1024;
        
        if (currentSizeKB > maxSizeKB && quality > 0.1) {
          quality -= 0.1;
          tryCompress();
        } else {
          resolve(compressedFile);
        }
      };
      
      tryCompress();
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
}

// Image prefetch function to help with mobile loading
export const prefetchImage = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Function to handle image compression based on device type
export const processImageForUpload = async (file: File): Promise<File> => {
  // For mobile devices, compress images before upload if it's an image file
  if (isMobileDevice() && file.type.startsWith('image/')) {
    try {
      console.log('Mobile device detected, compressing image before upload');
      const compressedFile = await compressImageForUpload(file);
      console.log(`Compressed image from ${file.size} to ${compressedFile.size} bytes`);
      return compressedFile;
    } catch (compressError) {
      console.warn('Image compression failed, using original file:', compressError);
      return file;
    }
  }
  
  return file;
};
