
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
        const { data, error, progress } = await supabase.storage
          .from('images')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (onProgress) {
          // Track upload progress
          let lastProgress = 0;
          
          progress((uploadProgress) => {
            const currentProgress = Math.round(uploadProgress.percentage);
            
            // Only call onProgress if the progress has changed
            if (currentProgress > lastProgress) {
              onProgress(currentProgress);
              lastProgress = currentProgress;
            }
          });
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
