
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

export type Dog = {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  color: string;
  registrationNumber?: string;
  image?: string;
  sire?: string;
  dam?: string;
  notes?: string;
  dewormingDate?: string;
  vaccinationDate?: string;
  heatHistory?: { date: string }[];
  heatInterval?: number;
  health?: {
    vaccinations: { name: string; date: string }[];
    medicalIssues: { issue: string; date: string; notes: string }[];
  };
  breedingHistory?: {
    matings: { partner: string; date: string; successful: boolean }[];
    litters: { date: string; puppies: number; notes: string }[];
  };
};

interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  addDog: (dog: Omit<Dog, 'id'>) => Promise<Dog | null>;
  removeDog: (id: string) => Promise<boolean>;
  updateDog: (id: string, data: Partial<Dog>) => Promise<boolean>;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  refreshDogs: () => Promise<void>;
}

const DogsContext = createContext<DogsContextType | undefined>(undefined);

export const DogsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabaseUser } = useAuth();
  
  // Fetch dogs from Supabase
  const fetchDogs = async () => {
    if (!supabaseUser) {
      console.log('No authenticated user, skipping dogs fetch');
      setDogs([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching dogs for user:', supabaseUser.id);
      
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching dogs:', error);
        setError(error.message);
        toast({
          title: 'Failed to load dogs',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Transform database records to Dog objects
      const transformedDogs: Dog[] = data.map(dog => ({
        id: dog.id,
        name: dog.name,
        breed: dog.breed || '',
        gender: (dog.gender as 'male' | 'female') || 'female',
        dateOfBirth: dog.birthdate || new Date().toISOString(),
        color: dog.color || '',
        registrationNumber: dog.registration_number,
        image: dog.image_url,
        notes: dog.notes,
        // Default empty arrays for collections
        heatHistory: [],
        health: {
          vaccinations: [],
          medicalIssues: []
        },
        breedingHistory: {
          matings: [],
          litters: []
        }
      }));
      
      console.log(`Fetched ${transformedDogs.length} dogs`);
      setDogs(transformedDogs);
      setError(null);
    } catch (err) {
      console.error('Unexpected error fetching dogs:', err);
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'Failed to load your dogs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchDogs();
  }, [supabaseUser]);
  
  // Refresh dogs data
  const refreshDogs = async () => {
    await fetchDogs();
  };
  
  // Add a dog
  const addDog = async (dogData: Omit<Dog, 'id'>): Promise<Dog | null> => {
    if (!supabaseUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to add a dog',
        variant: 'destructive'
      });
      return null;
    }
    
    try {
      setLoading(true);
      
      // Convert from frontend model to database model
      const dbDog = {
        name: dogData.name,
        breed: dogData.breed,
        gender: dogData.gender,
        birthdate: dogData.dateOfBirth ? new Date(dogData.dateOfBirth).toISOString().split('T')[0] : null,
        color: dogData.color,
        registration_number: dogData.registrationNumber,
        image_url: dogData.image,
        notes: dogData.notes,
        owner_id: supabaseUser.id
      };
      
      console.log('Adding new dog:', dbDog.name);
      const { data, error } = await supabase
        .from('dogs')
        .insert(dbDog)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding dog:', error);
        toast({
          title: 'Failed to add dog',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }
      
      // Transform the returned database record to a Dog object
      const newDog: Dog = {
        id: data.id,
        name: data.name,
        breed: data.breed || '',
        gender: (data.gender as 'male' | 'female') || 'female',
        dateOfBirth: data.birthdate || new Date().toISOString(),
        color: data.color || '',
        registrationNumber: data.registration_number,
        image: data.image_url,
        notes: data.notes,
        heatHistory: [],
        health: {
          vaccinations: [],
          medicalIssues: []
        },
        breedingHistory: {
          matings: [],
          litters: []
        }
      };
      
      // Update local state
      setDogs(prevDogs => [...prevDogs, newDog]);
      
      toast({
        title: 'Dog added',
        description: `${newDog.name} has been added to your dogs`,
      });
      
      return newDog;
    } catch (err) {
      console.error('Unexpected error adding dog:', err);
      toast({
        title: 'Error',
        description: 'Failed to add dog',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a dog
  const removeDog = async (id: string): Promise<boolean> => {
    if (!supabaseUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to remove a dog',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing dog:', error);
        toast({
          title: 'Failed to remove dog',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      setDogs(dogs.filter(dog => dog.id !== id));
      
      // If the active dog is the one being removed, clear it
      if (activeDog && activeDog.id === id) {
        setActiveDog(null);
      }
      
      toast({
        title: 'Dog removed',
        description: 'The dog has been removed from your records',
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error removing dog:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove dog',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update a dog
  const updateDog = async (id: string, data: Partial<Dog>): Promise<boolean> => {
    if (!supabaseUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to update a dog',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      // Convert from frontend model to database model
      const dbDog: any = {};
      
      if (data.name !== undefined) dbDog.name = data.name;
      if (data.breed !== undefined) dbDog.breed = data.breed;
      if (data.gender !== undefined) dbDog.gender = data.gender;
      if (data.dateOfBirth !== undefined) dbDog.birthdate = new Date(data.dateOfBirth).toISOString().split('T')[0];
      if (data.color !== undefined) dbDog.color = data.color;
      if (data.registrationNumber !== undefined) dbDog.registration_number = data.registrationNumber;
      if (data.image !== undefined) dbDog.image_url = data.image;
      if (data.notes !== undefined) dbDog.notes = data.notes;
      
      console.log('Updating dog:', id);
      const { error } = await supabase
        .from('dogs')
        .update(dbDog)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating dog:', error);
        toast({
          title: 'Failed to update dog',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      setDogs(dogs.map(dog => dog.id === id ? { ...dog, ...data } : dog));
      
      // If we're updating the active dog, update it too
      if (activeDog && activeDog.id === id) {
        setActiveDog({ ...activeDog, ...data });
      }
      
      toast({
        title: 'Dog updated',
        description: 'The dog information has been updated',
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error updating dog:', err);
      toast({
        title: 'Error',
        description: 'Failed to update dog',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DogsContext.Provider value={{ 
      dogs, 
      loading,
      error,
      addDog, 
      removeDog, 
      updateDog, 
      activeDog, 
      setActiveDog,
      refreshDogs
    }}>
      {children}
    </DogsContext.Provider>
  );
};

export const useDogs = () => {
  const context = useContext(DogsContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
};
