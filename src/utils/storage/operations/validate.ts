
import { BUCKET_NAME } from '../config';

/**
 * Check if a URL is a valid public URL from our storage
 * 
 * @param url The URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export const isValidPublicUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    // Check if URL has basic structure
    if (!url.startsWith('http')) return false;
    
    // Check if URL contains our bucket name
    if (!url.includes(BUCKET_NAME)) return false;
    
    // Attempt to parse the URL (will throw if invalid)
    new URL(url);
    
    return true;
  } catch (error) {
    console.error('Invalid public URL:', error);
    return false;
  }
};
