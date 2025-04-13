
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
      try {
        console.log("Processing base64 image");
        imageUrl = await uploadDogImageFromBase64(imageUrl, id);
        console.log("Uploaded image URL:", imageUrl);
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        toast({
          title: "Image Upload Failed",
          description: "Could not upload the image, but we'll continue saving other data.",
          variant: "destructive",
        });
        // Continue with existing image if there's an error
        imageUrl = dog.image_url;
      }
    }
    
    // Validate dates before sending to the database
    const validateDate = (dateStr: string | undefined): string | null => {
      if (!dateStr) return null;
      // Make sure the date is in ISO format (YYYY-MM-DD)
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : dateStr;
    };
    
    // Format the data for database update
    const dbDog = {
      name: dog.name,
      breed: dog.breed,
      gender: dog.gender,
      date_of_birth: validateDate(dog.dateOfBirth),
      color: dog.color,
      registration_number: dog.registrationNumber,
      notes: dog.notes,
      deworming_date: validateDate(dog.dewormingDate),
      vaccination_date: validateDate(dog.vaccinationDate),
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
        description: `Failed to update dog: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }

    if (!data) {
      console.error('No data returned from update operation');
      toast({
        title: "Error",
        description: "Could not find the dog record to update.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Successfully updated dog:", data);

    // Map the database response back to our Dog type
    return {
      id: data.id,
      name: data.name,
      breed: data.breed,
      gender: data.gender as 'male' | 'female',
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
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};
