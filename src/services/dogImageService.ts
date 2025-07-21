
import { supabase } from '@/integrations/supabase/client';

export interface DogImageData {
  id: string;
  name: string;
  image_url: string | null;
}

export const dogImageService = {
  async getDogImages(dogIds: string[]): Promise<Record<string, string | null>> {
    if (!dogIds.length) return {};
    
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('id, name, image_url')
        .in('id', dogIds);
      
      if (error) {
        console.error('Error fetching dog images:', error);
        return {};
      }
      
      // Convert array to object with id as key
      const imageMap: Record<string, string | null> = {};
      data?.forEach((dog: DogImageData) => {
        imageMap[dog.id] = dog.image_url;
      });
      
      return imageMap;
    } catch (error) {
      console.error('Error in getDogImages:', error);
      return {};
    }
  }
};
