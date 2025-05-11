import React, { useState, useCallback, useEffect } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { processImageForUpload } from '@/utils/storage';
import { toast } from '@/components/ui/use-toast';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { BUCKET_NAME } from '@/utils/storage/config';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { useUpdatePuppyMutation } from '@/hooks/puppies/queries/useUpdatePuppyMutation';
import { PuppyImageUploaderProps } from '@/hooks/image-upload/types';

interface PuppyImageUploaderProps {
  puppyName: string;
  puppyId?: string;
  litterId?: string;
  currentImage?: string;
  onImageChange: (url: string) => void;
  large?: boolean;
}

const PuppyImageUploader: React.FC<PuppyImageUploaderProps> = ({
  puppyName,
  puppyId,
  litterId,
  currentImage,
  onImageChange,
  large = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const [error, setError] = useState<string>('');
  const { safari: isSafariBrowser, device: platformDevice } = getPlatformInfo();
  
  // Get the update mutation to save images directly to database
  const updatePuppyMutation = litterId ? useUpdatePuppyMutation(litterId) : null;

  // Update local state when prop changes
  useEffect(() => {
    setImageUrl(currentImage || '');
  }, [currentImage]);

  const saveImageToDatabase = useCallback(async (url: string) => {
    if (!puppyId || !litterId || !updatePuppyMutation) {
      console.error('Cannot save image: missing puppy ID, litter ID, or mutation');
      return;
    }
    
    try {
      await updatePuppyMutation.mutateAsync({
        id: puppyId,
        imageUrl: url
      });
      
      console.log('Image URL saved to database for puppy:', puppyId);
    } catch (error) {
      console.error('Failed to save image URL to database:', error);
      throw error;
    }
  }, [puppyId, litterId, updatePuppyMutation]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const platformInfo = getPlatformInfo();
    
    console.log('PuppyImageUploader: File selected for upload', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      type: file.type || 'unknown',
      platform: platformInfo.device
    });
    
    // More forgiving size check (+5% for Safari)
    const effectiveMaxSize = platformInfo.safari ? 5.25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > effectiveMaxSize) {
      console.log('PuppyImageUploader: File too large', {
        size: file.size,
        limit: effectiveMaxSize
      });
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // First check session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log('PuppyImageUploader: No session found, attempting to refresh');
        // Try to refresh session for Safari
        if (platformInfo.safari) {
          console.log('Safari detected, attempting to refresh auth session');
          await supabase.auth.refreshSession();
          
          const refreshedSession = await supabase.auth.getSession();
          console.log('Session refresh result:', {
            success: !!refreshedSession.data.session,
            error: refreshedSession.error
          });
        }
      }

      // Process image (compress) before uploading
      const processedFile = await processImageForUpload(file);
      console.log(`PuppyImageUploader: Original file: ${file.size} bytes, processed: ${processedFile.size} bytes`);

      // Create a unique filename with uuid
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `puppies/${uuidv4()}.${fileExt}`;

      console.log(`PuppyImageUploader: Uploading to ${BUCKET_NAME}/${fileName}`, {
        fileSize: processedFile.size,
        platform: platformInfo.device
      });

      // Upload with retry logic for better Safari support
      const uploadWithRetry = async () => {
        return fetchWithRetry(
          () => supabase.storage
            .from(BUCKET_NAME) // Use the constant from config
            .upload(fileName, processedFile, {
              cacheControl: '3600',
              upsert: true
            }),
          { 
            maxRetries: platformInfo.safari ? 3 : 2,
            initialDelay: 2000,
            useBackoff: true
          }
        );
      };

      const uploadResult = await uploadWithRetry();
      console.log('PuppyImageUploader: Upload result:', {
        error: uploadResult.error || 'none',
        data: uploadResult.data ? 'success' : 'no data',
        statusCode: uploadResult.error ? (uploadResult.error as any).statusCode || 'unknown' : 'none'
      });

      if (uploadResult.error) {
        console.error('PuppyImageUploader: Upload error:', uploadResult.error);
        throw uploadResult.error;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrl } = supabase.storage
        .from(BUCKET_NAME) // Use the constant from config
        .getPublicUrl(fileName);

      console.log('PuppyImageUploader: Got public URL:', {
        url: publicUrl?.publicUrl || 'undefined',
        fileName
      });

      if (publicUrl) {
        // Add cache busting for Safari
        let finalUrl = publicUrl.publicUrl;
        if (platformInfo.safari) {
          const separator = finalUrl.includes('?') ? '&' : '?';
          finalUrl += `${separator}_t=${Date.now()}`;
        }
        
        console.log('PuppyImageUploader: Setting image URL:', finalUrl);
        
        // Update local state
        setImageUrl(finalUrl);
        
        // Update UI via callback
        onImageChange(finalUrl);
        
        // Save to database
        await saveImageToDatabase(finalUrl);
        
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        throw new Error('Failed to get public URL');
      }
    } catch (error) {
      console.error('PuppyImageUploader: Error uploading image:', error);
      setError('Error uploading image. Please try again.');

      // Safari-specific error message
      if (platformInfo.safari) {
        setError('Safari upload issue. Try a smaller image or use Chrome.');
      }
      
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange, saveImageToDatabase]);

  const handleRemoveImage = useCallback(async () => {
    // If we have an image URL, try to remove it from database
    if (imageUrl) {
      try {
        // Clear the image in the database
        await saveImageToDatabase('');
        
        // Clear the UI
        setImageUrl('');
        onImageChange('');
      } catch (error) {
        console.error('Error removing image from database:', error);
        toast({
          title: "Error",
          description: "Failed to remove image. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      setImageUrl('');
      onImageChange('');
    }
  }, [imageUrl, onImageChange, saveImageToDatabase]);

  const initials = puppyName
    ? puppyName.substring(0, 2).toUpperCase()
    : 'PU';

  const avatarSizeClass = large 
    ? "w-40 h-40 text-3xl"
    : "w-16 h-16 text-sm";
    
  const buttonSizeClass = large
    ? "bottom-2 right-2"
    : "bottom-0 right-0";

  // Remove Safari help by returning null
  const renderSafariHelp = () => {
    return null;
  };

  return (
    <div className={`relative ${large ? 'mx-auto' : ''}`}>
      <Avatar className={`${avatarSizeClass} bg-primary/10 text-primary`}>
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={puppyName} />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`absolute ${buttonSizeClass} flex gap-1`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 w-8 rounded-full p-0 shadow-md"
          onClick={() => document.getElementById(`puppy-image-upload-${puppyId || 'new'}`)?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          <span className="sr-only">Upload image</span>
        </Button>

        {imageUrl && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 w-8 rounded-full p-0 shadow-md"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        )}
      </div>

      <input
        type="file"
        id={`puppy-image-upload-${puppyId || 'new'}`}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && (
        <p className="text-destructive text-xs mt-1">{error}</p>
      )}

      {isUploading && (
        <p className="text-muted-foreground text-xs mt-1">Uploading...</p>
      )}
      
      {renderSafariHelp()}
    </div>
  );
};

export default PuppyImageUploader;
