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
  const BUCKET_NAME = 'Dog Photos'; // Exact match with Supabase bucket name

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

  const uploadImage = async (file: File) => {
    if (!user_id || !validateFile(file)) return;
    
    setIsUploading(true);
    console.log('Starting image upload to bucket:', BUCKET_NAME);
    
    try {
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

      console.log('Attempting to upload file:', fileName);
      
      // Check if the bucket exists before uploading
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        throw bucketError;
      }
      
      console.log('Available buckets:', buckets.map(b => b.name));
      
      const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
      if (!bucketExists) {
        console.error(`Bucket "${BUCKET_NAME}" does not exist!`);
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist`);
      }
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearTimeout(uploadTimeoutRef.current);
      
      if (error) {
        console.error('Supabase storage upload error:', error);
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
    // Skip removal if URL doesn't contain the storage path pattern
    if (!imageUrl || !imageUrl.includes(BUCKET_NAME) || !userId) {
      console.log('Skipping image removal: Invalid image URL or user ID');
      onImageChange('');
      return;
    }
    
    try {
      // Extract the storage path from the URL
      const urlParts = imageUrl.split('/');
      const storageIndex = urlParts.findIndex(part => part === BUCKET_NAME);
      
      if (storageIndex === -1) {
        console.log('No valid storage path found in URL:', imageUrl);
        onImageChange('');
        return;
      }
      
      // Reconstruct the storage path
      const storagePath = urlParts.slice(storageIndex + 1).join('/');
      console.log('Removing image from storage path:', storagePath);
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);
      
      if (error) throw error;
      
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
