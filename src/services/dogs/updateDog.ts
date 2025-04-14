
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { mapDogToDbDog, mapDbDogToDog } from "./mappers";
import { uploadDogImageFromBase64 } from "./imageService";

// Update a dog
export const updateDog = async (id: string, dog: Partial<Dog>): Promise<Dog> => {
  try {
    console.log("Updating dog with data:", dog);
    
    // Check if we need to process a base64 image
    let imageUrl = dog.image_url;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        console.log("Processing base64 image");
        imageUrl = await uploadDogImageFromBase64(imageUrl, id);
        console.log("Uploaded image URL:", imageUrl);
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        // Continue with existing image if there's an error
        imageUrl = dog.image_url;
      }
    }
    
    // Map client model to database fields
    const dbDog = {
      ...mapDogToDbDog(dog),
      image_url: imageUrl,
      updated_at: new Date().toISOString()
    };
    
    console.log("Sending to database:", dbDog);
    
    const { data, error } = await supabase
      .from('dogs')
      .update(dbDog)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dog:', error);
      throw new Error(`Failed to update dog: ${error.message}`);
    }

    if (!data) {
      throw new Error("Could not find the dog record to update.");
    }

    console.log("Successfully updated dog:", data);

    return mapDbDogToDog(data);
  } catch (error) {
    console.error('Unexpected error updating dog:', error);
    throw error;
  }
};
