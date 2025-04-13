
import { supabase } from "@/integrations/supabase/client";
import { Dog, HeatRecord } from "@/types/dogs";
import { format } from "date-fns";
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

    // Map database fields to our client-side model
    return (data || []).map(dog => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      gender: dog.gender,
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
      gender: data.gender,
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

    return {
      id: data.id,
      name: data.name,
      breed: data.breed,
      gender: data.gender,
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
    // Format dates for database
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
      image_url: dog.image_url,
      updated_at: new Date().toISOString()
    };
    
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

    toast({
      title: "Success",
      description: `${data.name}'s information has been updated.`,
    });

    return {
      id: data.id,
      name: data.name,
      breed: data.breed,
      gender: data.gender,
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

// Fetch heat records for a dog
export const fetchHeatRecords = async (dogId: string): Promise<HeatRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('heat_records')
      .select('*')
      .eq('dog_id', dogId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching heat records:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching heat records:', error);
    return [];
  }
};

// Add a heat record
export const addHeatRecord = async (dogId: string, date: Date): Promise<boolean> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { error } = await supabase
      .from('heat_records')
      .insert({
        dog_id: dogId,
        date: formattedDate
      });

    if (error) {
      console.error('Error adding heat record:', error);
      toast({
        title: "Error",
        description: "Failed to add heat record. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Heat record has been added.",
    });

    return true;
  } catch (error) {
    console.error('Unexpected error adding heat record:', error);
    return false;
  }
};

// Delete a heat record
export const deleteHeatRecord = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('heat_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting heat record:', error);
      toast({
        title: "Error",
        description: "Failed to delete heat record. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Heat record has been removed.",
    });

    return true;
  } catch (error) {
    console.error('Unexpected error deleting heat record:', error);
    return false;
  }
};

// Upload dog image
export const uploadDogImage = async (file: File, dogId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${dogId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('dog_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('dog_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
};
