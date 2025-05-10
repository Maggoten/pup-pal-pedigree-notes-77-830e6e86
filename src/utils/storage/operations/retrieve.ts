
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';
import { fetchWithRetry } from '@/utils/fetchUtils';

/**
 * Get public URL for a storage object
 */
export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * List objects in storage with pagination support
 */
export const listStorageObjects = async (
  folder: string = '',
  options: { limit?: number; offset?: number; sortBy?: { column: string; order: string } } = {}
) => {
  try {
    const { limit = 100, offset = 0, sortBy } = options;
    
    // Use fetchWithRetry for better reliability
    const result = await fetchWithRetry(() => 
      supabase.storage
        .from(BUCKET_NAME)
        .list(folder, {
          limit,
          offset,
          sortBy: sortBy ? { column: sortBy.column, order: sortBy.order as any } : undefined
        })
    );
    
    return result;
  } catch (error) {
    console.error('Error listing storage objects:', error);
    throw error;
  }
};
