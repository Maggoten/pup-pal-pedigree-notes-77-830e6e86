
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dog, Gender } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';

export const useDogs = (userId: string | undefined) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDogs = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      console.log("🐶 FETCHED DOGS:", data);

      if (error) {
        setError(error.message);
        toast({
          title: "Error fetching dogs",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Normalize data to match our Dog interface with aliases
        const normalized = (data || []).map((dog) => {
          // Normalize gender to ensure it's either 'male' or 'female'
          const normalizedGender: Gender = 
            dog.gender === 'male' || dog.gender === 'female'
              ? dog.gender as Gender
              : (dog.gender?.toLowerCase() === 'male' ? 'male' : 'female');
          
          return {
            ...dog,
            // Normalize Supabase fields to our UI field aliases
            dateOfBirth: dog.birthdate || new Date().toISOString().split('T')[0], // Default to today if missing
            registrationNumber: dog.registration_number || '',
            image: dog.image_url || '/placeholder.svg', // Default image
            gender: normalizedGender,
            // Initialize breeding-related fields if they don't exist
            heatHistory: dog.heatHistory || [],
            breedingHistory: dog.breedingHistory || { litters: [], breedings: [] }
          } as Dog;
        });

        setDogs(normalized);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDog = async (dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      
      // Convert UI field aliases to Supabase field names
      const supabaseDogData = {
        name: dogData.name,
        breed: dogData.breed,
        gender: dogData.gender,
        owner_id: userId,
        birthdate: dogData.dateOfBirth,
        color: dogData.color,
        registration_number: dogData.registrationNumber,
        image_url: dogData.image,
        notes: dogData.notes,
        // Include any additional fields that might be in the database
        heatHistory: dogData.heatHistory,
        heatInterval: dogData.heatInterval,
        breedingHistory: dogData.breedingHistory
      };
      
      const { data, error } = await supabase
        .from('dogs')
        .insert([supabaseDogData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Dog added",
        description: `${dogData.name} has been added successfully.`,
      });
      
      // Convert the returned Supabase data to our Dog interface
      const normalizedDog: Dog = {
        ...data,
        dateOfBirth: data.birthdate || new Date().toISOString().split('T')[0],
        registrationNumber: data.registration_number || '',
        image: data.image_url || '/placeholder.svg',
        gender: data.gender as Gender,
        heatHistory: data.heatHistory || [],
        breedingHistory: data.breedingHistory || { litters: [], breedings: [] }
      };
      
      await fetchDogs();
      return normalizedDog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error adding dog",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDog = async (id: string, updates: Partial<Dog>) => {
    try {
      setIsLoading(true);
      
      // Convert UI field aliases to Supabase field names if they exist in updates
      const supabaseUpdates: any = { ...updates };
      
      if (updates.dateOfBirth !== undefined) {
        supabaseUpdates.birthdate = updates.dateOfBirth;
        delete supabaseUpdates.dateOfBirth; // Remove UI alias
      }
      
      if (updates.registrationNumber !== undefined) {
        supabaseUpdates.registration_number = updates.registrationNumber;
        delete supabaseUpdates.registrationNumber; // Remove UI alias
      }
      
      if (updates.image !== undefined) {
        supabaseUpdates.image_url = updates.image;
        delete supabaseUpdates.image; // Remove UI alias
      }
      
      const { error } = await supabase
        .from('dogs')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast({
        title: "Dog updated",
        description: "Dog information has been updated successfully.",
      });
      
      await fetchDogs();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDog = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
      
      await fetchDogs();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDogs();
    } else {
      setDogs([]);
    }
  }, [userId]);

  return {
    dogs,
    isLoading,
    error,
    fetchDogs,
    addDog,
    updateDog,
    deleteDog
  };
};
