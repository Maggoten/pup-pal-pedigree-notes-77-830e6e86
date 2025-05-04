
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StorageError } from '@supabase/storage-js';
import { validateImageFile } from '@/utils/imageValidation';
import { checkBucketExists, uploadToStorage, getPublicUrl, removeFromStorage, BUCKET_NAME } from '@/utils/storageUtils';
import { useUploadTimeout } from '@/hooks/useUploadTimeout';

interface UseImageUploadProps {
  user_id: string | undefined;
  onImageChange: (imageUrl: string) => void;
}

export const useImageUpload = ({ user_id, onImageChange }: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { startTimeout, clearTimeout } = useUploadTimeout(() => setIsUploading(false));

  const uploadImage = async (file: File) => {
    if (!user_id) {
      console.error('Upload failed: No user ID provided');
      toast({
        title: "Authentication Error",
        description: "Please login again to upload images",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateImageFile(file)) return;
    
    setIsUploading(true);
    console.log('Starting image upload to bucket:', BUCKET_NAME);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session. User authentication is required for uploads.');
      }
      console.log('Active session found for user:', sessionData.session.user.id);
      
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user_id}/${Date.now()}.${fileExt}`;
      
      startTimeout();

      const { data, error } = await uploadToStorage(fileName, file);
      
      clearTimeout();
      
      if (error) {
        const errorMessage = error instanceof StorageError 
          ? error.message 
          : "Could not upload the image";
        
        console.error('Upload error:', {
          error,
          message: errorMessage,
          details: error instanceof StorageError ? error.message : 'Unknown error'
        });

        throw error;
      }
      
      console.log('Upload successful, getting public URL');
      
      const { data: { publicUrl } } = getPublicUrl(fileName);
      
      console.log('Generated public URL:', publicUrl);
      onImageChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      clearTimeout();
    }
  };

  const removeImage = async (imageUrl: string, userId: string) => {
    if (!imageUrl || !imageUrl.includes(BUCKET_NAME) || !userId) {
      console.log('Skipping image removal: Invalid image URL or user ID', {
        imageUrl,
        userId,
        bucketInUrl: imageUrl ? imageUrl.includes(BUCKET_NAME) : false
      });
      onImageChange('');
      return;
    }
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session. User authentication is required.');
      }
      
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      const urlParts = imageUrl.split('/');
      const storageIndex = urlParts.findIndex(part => part === BUCKET_NAME);
      
      if (storageIndex === -1) {
        console.log('No valid storage path found in URL:', imageUrl);
        onImageChange('');
        return;
      }
      
      const storagePath = urlParts.slice(storageIndex + 1).join('/');
      console.log('Removing image from storage path:', storagePath);
      
      const { error } = await removeFromStorage(storagePath);
      
      if (error) {
        console.error('Error removing image:', error);
        
        const errorMessage = error instanceof StorageError 
          ? error.message 
          : "Failed to remove image";
        
        console.error('Error details:', {
          error,
          message: errorMessage
        });
        
        throw error;
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
        description: "Failed to remove image. The update will continue without removing the old image.",
        variant: "destructive"
      });
      onImageChange('');
    }
  };

  return {
    isUploading,
    uploadImage,
    removeImage
  };
};
