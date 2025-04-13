
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { toast } from "@/components/ui/use-toast";
import { uploadDogImageFromBase64 } from "./imageService";

// Update a dog
export const updateDog = async (id: string, dog: Partial<Dog>): Promise<Dog | null> => {
  try {
    console.log("Updating dog with data:", dog);
    
    // Check if we need to process a base64 image
    let imageUrl = dog.image_url;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      console.log("Processing base64 image");
      imageUrl = await uploadDogImageFromBase64(imageUrl, id);
      console.log("Uploaded image URL:", imageUrl);
    }
    
    // Format the data for database update
    const dbDog = {
      name: dog.name,
      breed: dog.breed,
      gender: dog.gender,
      date_of_birth: dog.dateOfBirth,
      color: dog.color,
      registration_number: dog.registrationNumber,
      notes: dog.notes,
      deworming_date: dog.dewormingDate,
      vaccination_date: dog.vaccinationDate,
      heat_interval: dog.heatInterval,
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
      toast({
        title: "Error",
        description: "Failed to update dog. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Successfully updated dog:", data);

    return {
      id: data.id,
      name: data.name,
      breed: data.breed,
      gender: data.gender as 'male' | 'female', // Cast gender to the expected type
      dateOfBirth: data.date_of_birth,
      color: data.color,
      registrationNumber: data.registration_number,
      notes: data.notes,
      dewormingDate: data.deworming_date,
      vaccinationDate: data.vaccination_date,
      heatInterval: data.heat_interval,
      image_url: data.image_url
    };
  } catch (error) {
    console.error('Unexpected error updating dog:', error);
    return null;
  }
};
