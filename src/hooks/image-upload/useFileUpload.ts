
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { compressImage } from '@/utils/storage/imageUtils';
import { toast } from '@/hooks/use-toast';
import { UploadResult } from './types';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Hook to handle file upload functionality
 */
export const useFileUpload = (
  user_id: string | null | undefined,
  onImageChange: (url: string) => void,
  onImageSaved?: (url: string) => Promise<void>
) => {
  const { isAuthReady } = useAuth();
  const uploadInProgressRef = useRef(false);
  
  /**
   * Process and upload a file to storage
   */
  const performUpload = async (file: File): Promise<boolean> => {
    // Prevent multiple concurrent uploads
    if (uploadInProgressRef.current) {
      console.warn('Upload already in progress');
      return false;
    }
    
    try {
      uploadInProgressRef.current = true;
      
      // Check if user is authenticated
      if (!isAuthReady || !user_id) {
        throw new Error('User is not authenticated');
      }
      
      // Basic file validation
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image size exceeds the 5MB limit');
      }
      
      // Compress the image for better upload/display performance
      const compressedFile = await compressImage(file);
      
      // Upload file to Supabase Storage
      const { publicUrl, error } = await uploadToStorage(compressedFile, user_id);
      
      if (error || !publicUrl) {
        throw new Error(error?.message || 'Failed to upload image');
      }
      
      // Update the UI with the new image
      onImageChange(publicUrl);
      
      // If a save callback is provided, save the image URL to the database
      if (onImageSaved) {
        try {
          await onImageSaved(publicUrl);
          toast({
            title: 'Image saved successfully',
            description: 'Your changes have been saved to the database',
          });
        } catch (saveError) {
          console.error('Error saving image to database:', saveError);
          toast({
            title: 'Image displayed but not saved',
            description: 'There was a problem saving to database. Try saving the form.',
            variant: 'destructive',
          });
          // Return true anyway since the image upload itself was successful
          return true;
        }
      }
      
      return true;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Image upload error:', errorMessage);
      
      toast({
        title: 'Upload failed',
        description: errorMessage || 'There was a problem uploading your image',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      uploadInProgressRef.current = false;
    }
  };
  
  /**
   * Handle the actual upload to Supabase Storage
   */
  const uploadToStorage = async (file: File, userId: string): Promise<{ publicUrl?: string; error?: Error }> => {
    // Get device/platform information for error handling
    const platform = getPlatformInfo();
    console.log(`Uploading from: ${platform.mobile ? 'Mobile' : 'Desktop'}, Browser: ${platform.safari ? 'Safari' : 'Other'}`);
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload to the user's folder in storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        }) as UploadResult;
      
      if (error) {
        console.error('Storage upload error:', error);
        
        // Special handling for mobile Safari
        if (platform.mobile && platform.safari) {
          toast({
            title: 'Mobile upload issue',
            description: 'Safari on iOS may have limited storage access. Try a different browser.',
            variant: 'destructive',
          });
        }
        
        return { error: new Error(error.message || 'Upload failed') };
      }
      
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data?.path || '');
      
      return { publicUrl };
    } catch (error: any) {
      console.error('Unexpected upload error:', error);
      return { error: new Error('Unexpected error during upload') };
    }
  };
  
  return { performUpload };
};
