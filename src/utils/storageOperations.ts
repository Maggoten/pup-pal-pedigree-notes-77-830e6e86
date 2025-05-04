
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const BUCKET_NAME = 'Dog Photos';

export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Storage bucket check failed: No active session', sessionError);
      return false;
    }

    console.log('Checking if bucket exists:', BUCKET_NAME);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Error checking bucket existence:', error);
      return false;
    }
    
    console.log('Bucket exists, can list files:', BUCKET_NAME, data);
    return true;
  } catch (err) {
    console.error('Error in bucket verification:', err);
    return false;
  }
};

export const uploadToStorage = async (fileName: string, file: File) => {
  return supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
};

export const getPublicUrl = (fileName: string) => {
  return supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
};

export const removeFromStorage = async (storagePath: string) => {
  return supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);
};
