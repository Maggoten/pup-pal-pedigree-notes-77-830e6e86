
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { generateUniqueId } from '@/utils/uniqueId';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession, refreshSession } from '@/utils/auth/sessionManager';
import { uploadToStorage, getPublicUrl } from '@/utils/storage';
import { processImageForUpload } from '@/utils/storage';
import { uploadStateManager, setUploadPending } from '@/components/AuthGuard';
import { BUCKET_NAME, STORAGE_ERRORS } from '@/utils/storage/config';

export const useFileUpload = (user_id: string | null, onImageChange: (url: string) => void) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const performUpload = async (file: File): Promise<boolean> => {
    if (!file) {
      console.error("[FileUpload] No file provided");
      return false;
    }
    
    const platform = getPlatformInfo();
    const isMobile = platform.mobile || platform.safari;
    
    if (!user_id) {
      console.error("[FileUpload] No user ID provided");
      toast({
        title: "Upload Error",
        description: "You must be logged in to upload files.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log(`[FileUpload] Starting upload for file: ${file.name}`);
      
      // Track upload is active in the auth guard system
      uploadStateManager.incrementUploads();
      setUploadPending(true);
      
      // Verify session status before upload
      const sessionValid = await verifySession();
      
      if (!sessionValid) {
        console.log("[FileUpload] Session invalid, attempting refresh");
        const refreshed = await refreshSession();
        
        if (!refreshed && !isMobile) {
          console.error("[FileUpload] Failed to refresh session, cannot upload");
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Process image for upload (resize if needed)
      const processedFile = await processImageForUpload(file);
      if (!processedFile) {
        console.error("[FileUpload] Failed to process image");
        toast({
          title: "Upload Error",
          description: "Failed to process image. Please try a different file.",
          variant: "destructive"
        });
        return false;
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user_id}/${generateUniqueId()}.${fileExt}`;
      
      // Perform upload with progress tracking (mocked for now)
      setUploadProgress(10);
      console.log(`[FileUpload] Uploading to storage: ${fileName}`);
      
      // Perform the upload
      const uploadResult = await uploadToStorage(fileName, processedFile);
      
      if ('error' in uploadResult && uploadResult.error) {
        console.error("[FileUpload] Upload failed:", uploadResult.error);
        
        // Special handling for mobile auth errors
        if (isMobile && String(uploadResult.error).includes('auth')) {
          toast({
            title: "Upload Error",
            description: "Authentication issue. Try saving again or refreshing the page.",
            variant: "destructive",
            action: {
              label: "Refresh",
              onClick: () => window.location.reload()
            }
          });
        } else {
          toast({
            title: "Upload Error",
            description: String(uploadResult.error),
            variant: "destructive"
          });
        }
        
        return false;
      }
      
      console.log("[FileUpload] Upload completed successfully");
      setUploadProgress(100);
      
      // Get the public URL
      const fileData = uploadResult.data;
      if (!fileData) {
        console.error("[FileUpload] No file data returned");
        return false;
      }
      
      const publicUrlResult = await getPublicUrl(BUCKET_NAME, fileData.path);
      
      if ('error' in publicUrlResult && publicUrlResult.error) {
        console.error("[FileUpload] Failed to get public URL:", publicUrlResult.error);
        return false;
      }
      
      console.log("[FileUpload] Retrieved public URL:", publicUrlResult.data.publicUrl);
      
      // Pass the URL to the callback
      onImageChange(publicUrlResult.data.publicUrl);
      
      return true;
      
    } catch (error) {
      console.error("[FileUpload] Unhandled error during upload:", error);
      
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Ensure upload tracking is decremented even on error
      uploadStateManager.decrementUploads();
      // Clear upload pending flag with a small delay
      setTimeout(() => {
        setUploadPending(false);
      }, 1000);
    }
  };
  
  return { performUpload, uploadProgress };
};
