
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dog, BreedingHistory } from '@/types/dogs';
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
        // Normalize gender field
        const normalized = (data || []).map((dog): Dog => {
          // Create default breeding history structure if missing
          const defaultBreedingHistory: BreedingHistory = {
            breedings: [],
            litters: [],
            matings: [] // Include matings for compatibility with ReminderService
          };

          return {
            ...dog,

            // Aliases for UI
            dateOfBirth: dog.birthdate || '',
            image: dog.image_url || '',
            registrationNumber: dog.registration_number || '',

            // Fallbacks for frontend-only fields
            heatHistory: dog.heatHistory || [],
            breedingHistory: dog.breedingHistory || defaultBreedingHistory,
            heatInterval: dog.heatInterval || undefined,

            // Normalize gender just in case
            gender: dog.gender === 'male' || dog.gender === 'female'
              ? dog.gender
              : (dog.gender?.toLowerCase() === 'male' ? 'male' : 'female')
          };
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

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      
      // Prepare dog data for Supabase by mapping UI field names to DB field names
      const dogForDb = {
        ...dog,
        birthdate: dog.dateOfBirth,
        registration_number: dog.registrationNumber,
        image_url: dog.image,
        // Initialize these fields with empty arrays if they don't exist
        heatHistory: dog.heatHistory || [],
        breedingHistory: dog.breedingHistory || {
          breedings: [],
          litters: [],
          matings: []
        },
        owner_id: userId
      };
      
      const { data, error } = await supabase
        .from('dogs')
        .insert([dogForDb])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Dog added",
        description: `${dog.name} has been added successfully.`,
      });
      
      await fetchDogs();
      return data;
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
      const { error } = await supabase
        .from('dogs')
        .update(updates)
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
