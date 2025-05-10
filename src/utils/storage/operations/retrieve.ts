
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';
import { getPlatformInfo } from '../mobileUpload';

/**
 * Get public URL for a file - with cache-busting and validation
 * @param fileName The file name in storage
 * @returns Object containing the public URL
 */
export const getPublicUrl = (fileName: string) => {
  if (!fileName) {
    console.error('[Storage] Cannot get public URL: fileName is empty');
    return { data: { publicUrl: '' }, error: new Error('Empty fileName provided') };
  }

  console.log('[Storage] Getting public URL for:', fileName);
  
  const result = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  const platform = getPlatformInfo();
  
  // For Safari/mobile, add a cache-busting parameter
  if (platform.safari || platform.mobile) {
    if (result.data?.publicUrl) {
      const separator = result.data.publicUrl.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      result.data.publicUrl += `${separator}_t=${timestamp}`;
    }
  }
  
  // Log and validate the URL
  if (!result.data?.publicUrl) {
    console.error('[Storage] Failed to get public URL for:', fileName);
  } else {
    console.log('[Storage] Successfully generated public URL:', result.data.publicUrl.substring(0, 100) + '...');
  }
  
  return result;
};

/**
 * Validate if a public URL is properly formatted and accessible
 * @param url The public URL to validate
 * @returns boolean indicating if URL appears valid
 */
export const isValidPublicUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  
  // Basic validation - must be a string with reasonable length containing the bucket name
  const isValidFormat = url.length > 20 && 
                      url.includes(BUCKET_NAME) && 
                      (url.startsWith('http://') || url.startsWith('https://'));
  
  console.log(`[Storage] URL validation: ${isValidFormat ? 'valid' : 'invalid'} -`, 
              url.substring(0, 50) + (url.length > 50 ? '...' : ''));
              
  return isValidFormat;
};
