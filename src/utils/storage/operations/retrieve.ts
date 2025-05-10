
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';
import { getPlatformInfo } from '../mobileUpload';

/**
 * Get a public URL for a file in storage
 * 
 * @param filePath The path to the file in storage
 * @returns Object containing the public URL or error
 */
export const getPublicUrl = (filePath: string) => {
  const platform = getPlatformInfo();
  const result = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  
  // Add cache-busting for Safari/mobile
  if (platform.safari || platform.mobile) {
    if (result.data?.publicUrl) {
      const separator = result.data.publicUrl.includes('?') ? '&' : '?';
      result.data.publicUrl += `${separator}_t=${Date.now()}`;
    }
  }
  
  return result;
};
