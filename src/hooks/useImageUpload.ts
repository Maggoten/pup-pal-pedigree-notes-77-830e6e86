import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseImageUploadProps {
  user_id: string | undefined;
  onImageChange: (imageUrl: string) => void;
}

export const useImageUpload = ({ user_id, onImageChange }: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const uploadTimeoutRef = useRef<NodeJS.Timeout>();

  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const UPLOAD_TIMEOUT = 30000; // 30 seconds
  const BUCKET_NAME = 'dog-photos';

  const validateFile = (file: File) => {
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

  const getFilePathFromUrl = (url: string): string | null => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl('');
      
      const baseUrl = publicUrl.split('/' + BUCKET_NAME)[0] + '/' + BUCKET_NAME + '/';
      return url.replace(baseUrl, '');
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      return null;
    }
  };

  const deleteOldImage = async (oldImageUrl: string): Promise<boolean> => {
    try {
      if (!oldImageUrl) return true;
      
      const filePath = getFilePathFromUrl(oldImageUrl);
      if (!filePath) {
        console.error('Could not extract file path from URL:', oldImageUrl);
        return false;
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting old image:', error);
        return false;
      }

      console.log('Successfully deleted old image:', filePath);
      return true;
    } catch (error) {
      console.error('Error in deleteOldImage:', error);
      return false;
    }
  };

  const uploadImage = async (file: File, oldImageUrl?: string) => {
    if (!user_id || !validateFile(file)) return;
    
    setIsUploading(true);
    
    try {
      // If there's an old image, try to delete it first
      if (oldImageUrl) {
        const deleted = await deleteOldImage(oldImageUrl);
        if (!deleted) {
          console.warn('Failed to delete old image, but continuing with upload');
        }
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user_id}/${Date.now()}.${fileExt}`;
      
      uploadTimeoutRef.current = setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "Upload timeout",
          description: "The upload took too long. Please try again.",
          variant: "destructive"
        });
      }, UPLOAD_TIMEOUT);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // Don't use upsert to avoid overwriting
        });
      
      clearTimeout(uploadTimeoutRef.current);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
      onImageChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      clearTimeout(uploadTimeoutRef.current);
    }
  };

  const removeImage = async (imageUrl: string, userId: string) => {
    if (!imageUrl || !userId) return;
    
    try {
      const deleted = await deleteOldImage(imageUrl);
      
      if (!deleted) {
        throw new Error('Failed to delete image');
      }
      
      onImageChange('');
      
      toast({
        title: "Image Removed",
        description: "Your image has been successfully removed"
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove image",
        variant: "destructive"
      });
    }
  };

  return {
    isUploading,
    uploadImage,
    removeImage
  };
};
