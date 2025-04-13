
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dogs";
import { toast } from "@/components/ui/use-toast";

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
