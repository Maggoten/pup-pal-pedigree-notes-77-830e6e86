
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StorageError } from '@supabase/storage-js';

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
  const BUCKET_NAME = 'dog-photos'; // Using the internal bucket ID

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

  const checkBucketExists = async (): Promise<boolean> => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking buckets:', error);
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.id === BUCKET_NAME);
      console.log(`Bucket "${BUCKET_NAME}" ${bucketExists ? 'exists' : 'does not exist'} in available buckets:`, 
        buckets.map(b => b.id));
      
      return bucketExists;
    } catch (err) {
      console.error('Error in bucket verification:', err);
      return false;
    }
  };

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
    
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    console.log('Starting image upload to bucket:', BUCKET_NAME);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session. User authentication is required for uploads.');
      }
      console.log('Active session found for user:', sessionData.session.user.id);
      
      // Verify bucket exists before attempting upload
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
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

      console.log(`Attempting to upload file to bucket "${BUCKET_NAME}": ${fileName}`);
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearTimeout(uploadTimeoutRef.current);
      
      if (error) {
        const errorMessage = error instanceof StorageError 
          ? error.message 
          : "Could not upload the image";
        
        console.error('Upload error:', {
          error,
          message: errorMessage,
          details: error instanceof StorageError ? error.message : 'Unknown error',
          status: error instanceof StorageError ? error.statusCode : 'unknown'
        });

        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive"
        });

        throw error;
      }
      
      console.log('Upload successful, getting public URL');
      
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
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
      clearTimeout(uploadTimeoutRef.current);
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
      
      // Verify bucket exists before attempting deletion
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
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);
      
      if (error) {
        console.error('Error removing image:', error);
        
        const errorMessage = error instanceof StorageError 
          ? error.message 
          : "Failed to remove image";
        
        console.error('Error details:', {
          error,
          message: errorMessage,
          status: error instanceof StorageError ? error.statusCode : 'unknown'
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
