
import { isSafari } from './config';
import { MAX_FILE_SIZE } from '@/utils/imageValidation';
import { toast } from '@/components/ui/use-toast';

// Enhanced mobile detection with platform-specific handling
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod|android|blackberry|windows phone/i.test(userAgent) ||
    (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1) // iPadOS detection
  );
};

// Detailed platform info for debugging
export const getPlatformInfo = () => {
  const ua = navigator.userAgent;
  const mobile = isMobileDevice();
  const safari = isSafari();
  const iOS = /iP(ad|hone|od)/.test(ua);
  const device = mobile ? (iOS ? 'iOS' : 'Android') : 'Desktop';
  
  return {
    mobile,
    safari,
    iOS,
    device,
    userAgent: ua,
    maxTouchPoints: navigator.maxTouchPoints || 0
  };
};

// Safe canvas to blob conversion with fallbacks
export const safeCanvasToBlob = async (
  canvas: HTMLCanvasElement,
  type = 'image/jpeg',
  quality = 0.85
): Promise<Blob | null> => {
  // For debugging canvas issues
  console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);

  return new Promise((resolve) => {
    try {
      // First try the most compatible method
      if (typeof canvas.toBlob === 'function') {
        console.log('Using canvas.toBlob method for conversion');
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Canvas.toBlob successful: ${blob.size} bytes`);
              resolve(blob);
            } else {
              console.warn('Canvas.toBlob returned null, trying dataURL method');
              fallbackToDataURL();
            }
          },
          type,
          quality
        );
      } else {
        console.warn('Canvas.toBlob not available, using dataURL method');
        fallbackToDataURL();
      }
    } catch (err) {
      console.error('Error in canvas blob conversion:', err);
      fallbackToDataURL();
    }
    
    // Fallback using dataURL when toBlob fails
    function fallbackToDataURL() {
      try {
        console.log('Attempting dataURL fallback method');
        const dataUrl = canvas.toDataURL(type, quality);
        if (!dataUrl || dataUrl === 'data:,') {
          console.error('Canvas.toDataURL returned invalid data');
          resolve(null);
          return;
        }

        const base64 = dataUrl.split(',')[1];
        if (!base64) {
          console.error('Failed to extract base64 data from dataURL');
          resolve(null);
          return;
        }
        
        try {
          const binary = atob(base64);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], { type });
          console.log(`DataURL fallback successful: ${blob.size} bytes`);
          resolve(blob);
        } catch (blobErr) {
          console.error('Failed to create blob from base64:', blobErr);
          resolve(null);
        }
      } catch (dataUrlErr) {
        console.error('Canvas.toDataURL failed:', dataUrlErr);
        resolve(null);
      }
    }
  });
};

// Process image with fallbacks for mobile/Safari
export async function safeImageCompression(file: File): Promise<File> {
  const platform = getPlatformInfo();
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
  console.log(`Processing image on ${platform.device}`, {
    platform,
    fileSize: `${fileSizeMB}MB (${file.size} bytes)`,
    fileType: file.type || 'unknown'
  });
  
  // Skip compression for already small files and problematic formats on mobile
  const smallFileThreshold = 2.5 * 1024 * 1024; // 2.5MB
  if (file.size < smallFileThreshold) {
    console.log(`File already small (${fileSizeMB}MB), skipping compression`);
    return file;
  }
  
  if (platform.iOS && file.name.toLowerCase().match(/\.(heic|heif)$/)) {
    console.log('Skipping HEIC/HEIF compression on iOS');
    return file;
  }
  
  // For Safari or mobile, use a more robust method
  if (platform.mobile || platform.safari) {
    console.log(`Starting enhanced compression for ${platform.device} browser`);
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = async () => {
          try {
            console.log(`Image loaded successfully: ${img.width}x${img.height}`);
            const canvas = document.createElement('canvas');
            // Calculate scaled dimensions (max 1200px for mobile)
            const maxDim = platform.mobile ? 1200 : 1600;
            let { width, height } = img;
            
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
              console.log(`Image resized to ${width}x${height}`);
            } else {
              console.log(`Image size maintained at ${width}x${height} (below max dimension of ${maxDim}px)`);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('Failed to get 2D context');
              resolve(file); // Fallback to original
              return;
            }
            
            // Simple drawing with basic options
            ctx.imageSmoothingQuality = 'medium';
            ctx.drawImage(img, 0, 0, width, height);
            console.log('Image drawn to canvas, converting to blob...');
            
            // Try to get blob with safe fallbacks
            const compressionQuality = platform.safari ? 0.85 : 0.8;
            console.log(`Using compression quality: ${compressionQuality}`);
            
            const blob = await safeCanvasToBlob(
              canvas, 
              'image/jpeg', 
              compressionQuality
            );
            
            if (!blob) {
              console.warn('Canvas compression failed, using original file');
              resolve(file);
              return;
            }
            
            // Create a new file with .jpg extension
            const compressedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, "") + ".jpg", 
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            
            const originalSizeMB = fileSizeMB;
            const newSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
            const percentSize = Math.round(compressedFile.size / file.size * 100);
            
            console.log(`Compression result: ${originalSizeMB}MB → ${newSizeMB}MB (${percentSize}% of original)`);
            
            // If compression didn't help, use original
            if (compressedFile.size >= file.size) {
              console.log('Compression ineffective, using original file');
              resolve(file);
            } else {
              console.log('Compressed file will be used for upload');
              resolve(compressedFile);
            }
          } catch (err) {
            console.error('Error during canvas operations:', err);
            resolve(file); // Fallback to original
          }
        };
        
        img.onerror = (err) => {
          console.error('Failed to load image for compression:', err);
          resolve(file); // Fallback to original
        };
        
        console.log('Creating object URL for image loading...');
        img.src = URL.createObjectURL(file);
        
        // Set a timeout in case img.onload never fires
        setTimeout(() => {
          if (!img.complete) {
            console.warn('Image load timed out after 5s, using original file');
            resolve(file);
          }
        }, 5000);
        
      } catch (err) {
        console.error('Unexpected error in image compression:', err);
        resolve(file); // Fallback to original
      }
    });
  }
  
  // For desktop browsers, return the original file
  console.log('Using original file (desktop browser)');
  return file;
}

// Universal direct upload without compression
export const directUpload = async (file: File): Promise<File> => {
  // Log details about the file being uploaded directly
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
  console.log(`Direct upload: ${file.name}, Size: ${fileSizeMB}MB (${file.size} bytes), Type: ${file.type}`);
  return file;
};
