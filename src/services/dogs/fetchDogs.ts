import { supabase } from '@/integrations/supabase/client';
import { validateCrossStorageSession } from '@/utils/storage/core/session';
import { Dog } from '@/types/dogs';

export const fetchDogs = async (): Promise<Dog[]> => {
  try {
    // Validate session before fetching dogs
    const sessionValid = await validateCrossStorageSession({ skipThrow: true });
    if (!sessionValid) {
      console.error('fetchDogs: No valid session found');
      return [];
    }
    
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dogs:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchDogs:', error);
    throw error;
  }
};
