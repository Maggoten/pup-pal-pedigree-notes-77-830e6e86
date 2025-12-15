
import { supabase } from '@/integrations/supabase/client';

export interface DogImageData {
  id: string;
  name: string;
  image_url: string | null;
}

// Simple in-memory cache for dog images
const imageCache: Record<string, string | null> = {};
const cacheExpiry: Record<string, number> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const dogImageService = {
  async getDogImages(dogIds: string[]): Promise<Record<string, string | null>> {
    if (!dogIds.length) return {};
    
    const now = Date.now();
    
    // Filter out IDs that are already cached and not expired
    const uncachedIds = dogIds.filter(id => 
      !(id in imageCache) || cacheExpiry[id] < now
    );
    
    // Build result from cache for already cached IDs
    const result: Record<string, string | null> = {};
    dogIds.forEach(id => {
      if (id in imageCache && cacheExpiry[id] >= now) {
        result[id] = imageCache[id];
      }
    });
    
    // If all IDs are cached, return immediately
    if (uncachedIds.length === 0) {
      return result;
    }
    
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('id, name, image_url')
        .in('id', uncachedIds);
      
      if (error) {
        console.error('Error fetching dog images:', error);
        return result;
      }
      
      // Update cache and result with fetched data
      data?.forEach((dog: DogImageData) => {
        imageCache[dog.id] = dog.image_url;
        cacheExpiry[dog.id] = now + CACHE_DURATION;
        result[dog.id] = dog.image_url;
      });
      
      // Cache null for IDs that weren't found
      uncachedIds.forEach(id => {
        if (!(id in result)) {
          imageCache[id] = null;
          cacheExpiry[id] = now + CACHE_DURATION;
          result[id] = null;
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in getDogImages:', error);
      return result;
    }
  },
  
  // Clear cache for a specific dog (useful after image updates)
  clearCache(dogId?: string) {
    if (dogId) {
      delete imageCache[dogId];
      delete cacheExpiry[dogId];
    } else {
      Object.keys(imageCache).forEach(key => {
        delete imageCache[key];
        delete cacheExpiry[key];
      });
    }
  }
};
