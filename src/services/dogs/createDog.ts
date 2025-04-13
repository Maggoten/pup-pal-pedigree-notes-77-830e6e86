
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { toast } from "@/components/ui/use-toast";

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
