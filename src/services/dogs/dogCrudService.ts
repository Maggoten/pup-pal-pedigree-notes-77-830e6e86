
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { toast } from "@/components/ui/use-toast";
import { uploadDogImageFromBase64 } from "./imageService";

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
      toast({
        title: "Error",
        description: "Failed to fetch dogs. Please try again.",
        variant: "destructive",
      });
      return [];
    }

    console.log("Raw database dog data:", data);

    // Map database fields to our client-side model with proper type casting
    return (data || []).map(dog => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      gender: dog.gender as 'male' | 'female', // Cast gender to the expected type
      dateOfBirth: dog.date_of_birth,
      color: dog.color,
      registrationNumber: dog.registration_number,
      notes: dog.notes,
      dewormingDate: dog.deworming_date,
      vaccinationDate: dog.vaccination_date,
      heatInterval: dog.heat_interval,
      image_url: dog.image_url
    }));
  } catch (error) {
    console.error('Unexpected error fetching dogs:', error);
    return [];
  }
};

// Create a new dog
export const createDog = async (dog: Omit<Dog, "id">): Promise<Dog | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a dog",
        variant: "destructive",
      });
      return null;
    }

    // Format dates for database
    const dbDog = {
      user_id: userData.user.id,
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
      image_url: dog.image_url
    };
    
    console.log("Creating dog with data:", dbDog);
    
    const { data, error } = await supabase
      .from('dogs')
      .insert(dbDog)
      .select()
      .single();

    if (error) {
      console.error('Error creating dog:', error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: `${data.name} has been added to your dogs.`,
    });

    console.log("Dog created successfully:", data);

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
    console.error('Unexpected error creating dog:', error);
    return null;
  }
};

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
    console.error('Unexpected error fetching dog:', error);
    return null;
  }
};

// Delete a dog
export const deleteDog = async (id: string, dogName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dog:', error);
      toast({
        title: "Error",
        description: "Failed to delete dog. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: `${dogName} has been removed from your dogs.`,
    });

    return true;
  } catch (error) {
    console.error('Unexpected error deleting dog:', error);
    return false;
  }
};
