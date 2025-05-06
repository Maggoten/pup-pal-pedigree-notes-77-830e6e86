
import { toast } from '@/components/ui/use-toast';
import { EXTENDED_MIME_TYPES } from '@/utils/storage';

export const ALLOWED_FILE_TYPES = [
  ...EXTENDED_MIME_TYPES.JPEG,
  ...EXTENDED_MIME_TYPES.PNG,
  ...EXTENDED_MIME_TYPES.WEBP,
  ...EXTENDED_MIME_TYPES.HEIC,
  // Include generic types that Safari might return
  ...EXTENDED_MIME_TYPES.GENERIC
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Improved file type detection for Safari
const isImageFile = (file: File): boolean => {
  // First check the file extension as a backup
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  
  // If MIME type is in our allowed list or extension is valid image type
  return ALLOWED_FILE_TYPES.includes(file.type) || 
         imageExtensions.includes(fileExtension) ||
         file.type.startsWith('image/');
};

export const validateImageFile = (file: File) => {
  if (!isImageFile(file)) {
    console.log('File validation failed, type:', file.type);
    toast({
      title: "Invalid file type",
      description: "Please upload a valid image file (JPEG, PNG, WebP, or HEIC)",
      variant: "destructive"
    });
    return false;
  }
  
  // More lenient size check accounting for Safari's different calculations
  // +5% buffer to account for browser differences in size calculation
  const adjustedSize = file.size * 1.05;
  if (adjustedSize > MAX_FILE_SIZE) {
    console.log('File too large:', file.size, 'bytes');
    toast({
      title: "File too large",
      description: "Please select an image under 5MB",
      variant: "destructive"
    });
    return false;
  }

  return true;
};
