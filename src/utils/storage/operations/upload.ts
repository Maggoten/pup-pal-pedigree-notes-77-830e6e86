
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';

interface UploadResult {
  path?: string;
  error?: Error;
}

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  console.log(`[Storage] Uploading image to ${path}`);
  
  return fetchWithRetry(
    async () => {
      try {
        const { data, error } = await supabase.storage
          .from('images')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (onProgress) {
          // Track upload progress
          let lastProgress = 0;
          
          // Note: progress tracking is handled manually since Supabase v2 doesn't have built-in progress
          onProgress(10); // Initial progress indication
          
          // We will simulate progress since we can't track it directly in newer Supabase versions
          const interval = setInterval(() => {
            lastProgress += 10;
            if (lastProgress < 90) {
              onProgress(lastProgress);
            } else {
              clearInterval(interval);
            }
          }, 300);
          
          // Clear interval if there's an error
          if (error) {
            clearInterval(interval);
          }
        }
        
        if (error) {
          console.error("[Storage] Upload error:", error);
          throw error;
        }
        
        console.log(`[Storage] Uploaded file to ${data?.path}`);
        return { path: data?.path };
      } catch (uploadError: any) {
        console.error("[Storage] Upload failed:", uploadError);
        return { error: uploadError };
      }
    },
    {
      maxRetries: 3,
      initialDelay: 1500,
      onRetry: (attempt) => {
        console.log(`[Storage] Retrying upload (${attempt}/3)`);
        toast({
          title: "Retrying upload",
          description: `Connection issue detected. Retry ${attempt}/3...`
        });
      }
    }
  );
}

// Add the missing uploadToStorage function that's being imported elsewhere
export async function uploadToStorage(
  file: File, 
  userId: string
): Promise<{ publicUrl?: string; error?: Error }> {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload to the user's folder in storage
    const { path, error } = await uploadImage(file, filePath);
    
    if (error) {
      console.error('Storage upload error:', error);
      return { error: new Error(error.message || 'Upload failed') };
    }
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(path || '');
    
    return { publicUrl };
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return { error: new Error('Unexpected error during upload') };
  }
}
