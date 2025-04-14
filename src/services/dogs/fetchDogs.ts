
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { mapDbDogToDog } from './mappers';

// Fetch all dogs for the current user
export const fetchDogs = async (): Promise<Dog[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.log('No authenticated user found when fetching dogs');
      return [];
    }
    
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('name');

    if (error) {
      console.error('Error fetching dogs:', error);
      throw new Error(`Failed to fetch dogs: ${error.message}`);
    }

    console.log("Raw database dog data:", data);

    // Map database fields to our client-side model
    return (data || []).map(mapDbDogToDog);
  } catch (error) {
    console.error('Unexpected error fetching dogs:', error);
    throw error;
  }
};

// Fetch a specific dog by ID
export const fetchDogById = async (id: string): Promise<Dog | null> => {
  try {
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dog:', error);
      return null;
    }

    return mapDbDogToDog(data);
  } catch (error) {
    console.error('Unexpected error fetching dog:', error);
    return null;
  }
};
