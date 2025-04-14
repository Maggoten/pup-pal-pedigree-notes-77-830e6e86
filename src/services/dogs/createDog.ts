
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { mapDogToDbDog, mapDbDogToDog } from "./mappers";

// Create a new dog
export const createDog = async (dog: Omit<Dog, "id">): Promise<Dog> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error("You must be logged in to add a dog");
    }

    // Map client model to database fields
    const dbDog = {
      ...mapDogToDbDog(dog),
      user_id: userData.user.id
    };
    
    console.log("Creating dog with data:", dbDog);
    
    const { data, error } = await supabase
      .from('dogs')
      .insert(dbDog)
      .select()
      .single();

    if (error) {
      console.error('Error creating dog:', error);
      throw new Error(`Failed to add dog: ${error.message}`);
    }

    console.log("Dog created successfully:", data);

    return mapDbDogToDog(data);
  } catch (error) {
    console.error('Unexpected error creating dog:', error);
    throw error;
  }
};
