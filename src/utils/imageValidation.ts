
import { toast } from '@/hooks/use-toast';

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateImageFile = (file: File) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Please upload a JPEG, PNG, WebP, or HEIC image",
      variant: "destructive"
    });
    return false;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: "File too large",
      description: "Please select an image under 5MB",
      variant: "destructive"
    });
    return false;
  }

  return true;
};
