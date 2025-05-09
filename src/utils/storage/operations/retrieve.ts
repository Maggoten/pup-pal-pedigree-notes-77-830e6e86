
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';
import { getPlatformInfo } from '../mobileUpload';
import { isMobileDevice } from '@/utils/fetchUtils';

/**
 * Get public URL for a file - with cache-busting when needed
 * @param fileName The file name in storage
 * @returns Object containing the public URL
 */
export const getPublicUrl = (fileName: string) => {
  const result = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  const platform = getPlatformInfo();
  
  // For Safari/mobile, add a cache-busting parameter
  if (platform.safari || platform.mobile) {
    if (result.data?.publicUrl) {
      const separator = result.data.publicUrl.includes('?') ? '&' : '?';
      result.data.publicUrl += `${separator}_t=${Date.now()}`;
    }
  }
  
  return result;
};
