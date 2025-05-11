
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { compressImage } from '@/utils/storage/imageUtils';

export const useFileUpload = (
  user_id: string | null | undefined, 
  onImageChange: (url: string) => void,
  onImageSaved?: (url: string) => Promise<void>
) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadToStorage = useCallback(async (file: File): Promise<string | null> => {
    if (!user_id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload images.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      // Generate a unique filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileId = uuidv4();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${user_id}/${fileName}`;
      
      // Log platform information for debugging
      const platformInfo = getPlatformInfo();
      console.log('Upload platform info:', platformInfo);
      
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      // Upload file to Supabase
      const { data, error } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });
      
      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      if (!data || !data.path) {
        throw new Error('Upload failed: No path returned from storage');
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('user_uploads')
        .getPublicUrl(data.path);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      console.log('Image uploaded successfully:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Upload error:', errorMessage);
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [user_id]);

  const performUpload = async (file: File): Promise<boolean> => {
    setIsUploading(true);
    try {
      if (!user_id) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload images.",
          variant: "destructive"
        });
        return false;
      }
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select a valid image file.",
          variant: "destructive"
        });
        return false;
      }
      
      // Upload to storage
      const publicUrl = await uploadToStorage(file);
      
      // Update UI immediately if we have a URL
      if (publicUrl) {
        onImageChange(publicUrl);
        
        // Save to database if callback provided
        if (onImageSaved) {
          try {
            await onImageSaved(publicUrl);
            toast({
              title: "Image saved",
              description: "Your image has been uploaded and saved.",
            });
          } catch (error) {
            console.error('Failed to save image to database:', error);
            toast({
              title: "Image uploaded but not saved",
              description: "The image was uploaded but couldn't be saved to your profile.",
              variant: "destructive"
            });
          }
        }
        
        return true;
      }
      
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { performUpload, isUploading, uploadToStorage };
};
