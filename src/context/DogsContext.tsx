
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

export interface HeatRecord {
  date: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  color: string;
  dateOfBirth: string;
  registrationNumber?: string;
  dewormingDate?: string;
  vaccinationDate?: string;
  notes?: string;
  image?: string;
  heatHistory?: HeatRecord[];
  heatInterval?: number;
  user_id: string;
}

interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: Error | null;
  addDog: (dog: Omit<Dog, 'id' | 'user_id'>) => Promise<Dog | null>;
  updateDog: (id: string, dog: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string) => Promise<boolean>;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
}

const DogsContext = createContext<DogsContextType | undefined>(undefined);

export function DogsProvider({ children }: { children: ReactNode }) {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  const { user, isLoggedIn } = useAuth();

  // Fetch dogs when component mounts or user changes
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setDogs([]);
      setLoading(false);
      return;
    }

    const fetchDogs = async () => {
      try {
        setLoading(true);
        
        // Get dogs data
        const { data: dogsData, error: dogsError } = await supabase
          .from('dogs')
          .select('*')
          .eq('user_id', user.id);

        if (dogsError) throw dogsError;
        
        // For each dog, fetch its heat records
        const dogsWithHeat = await Promise.all(
          dogsData.map(async (dog) => {
            if (dog.gender === 'female') {
              const { data: heatData, error: heatError } = await supabase
                .from('heat_records')
                .select('*')
                .eq('dog_id', dog.id);

              if (heatError) throw heatError;
              
              // Convert to expected format
              const heatHistory = heatData.map(record => ({
                date: record.date
              }));
              
              return {
                ...dog,
                dateOfBirth: dog.date_of_birth,
                dewormingDate: dog.deworming_date,
                vaccinationDate: dog.vaccination_date,
                registrationNumber: dog.registration_number,
                heatHistory,
                image: dog.image_url
              };
            }
            
            return {
              ...dog,
              dateOfBirth: dog.date_of_birth,
              dewormingDate: dog.deworming_date,
              vaccinationDate: dog.vaccination_date,
              registrationNumber: dog.registration_number,
              image: dog.image_url
            };
          })
        );

        setDogs(dogsWithHeat);
      } catch (err) {
        console.error('Error fetching dogs:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, [user, isLoggedIn]);

  // Add a new dog
  const addDog = async (dogData: Omit<Dog, 'id' | 'user_id'>): Promise<Dog | null> => {
    try {
      if (!user) throw new Error('User must be logged in to add a dog');
      
      // Format dog data for insertion
      const newDog = {
        name: dogData.name,
        breed: dogData.breed,
        gender: dogData.gender,
        color: dogData.color,
        date_of_birth: dogData.dateOfBirth,
        registration_number: dogData.registrationNumber,
        deworming_date: dogData.dewormingDate,
        vaccination_date: dogData.vaccinationDate,
        notes: dogData.notes,
        image_url: dogData.image,
        heat_interval: dogData.heatInterval,
        user_id: user.id
      };
      
      // Insert dog
      const { data, error } = await supabase
        .from('dogs')
        .insert(newDog)
        .select()
        .single();

      if (error) throw error;
      
      // Format response
      const createdDog: Dog = {
        id: data.id,
        name: data.name,
        breed: data.breed,
        gender: data.gender,
        color: data.color,
        dateOfBirth: data.date_of_birth,
        registrationNumber: data.registration_number,
        dewormingDate: data.deworming_date,
        vaccinationDate: data.vaccination_date,
        notes: data.notes,
        image: data.image_url,
        heatInterval: data.heat_interval,
        user_id: data.user_id,
        heatHistory: []
      };
      
      // If it's a female dog with heat history, add heat records
      if (dogData.gender === 'female' && dogData.heatHistory && dogData.heatHistory.length > 0) {
        const heatRecords = dogData.heatHistory.map(record => ({
          dog_id: createdDog.id,
          date: record.date
        }));
        
        const { error: heatError } = await supabase
          .from('heat_records')
          .insert(heatRecords);
          
        if (heatError) throw heatError;
        
        createdDog.heatHistory = dogData.heatHistory;
      }
      
      // Update local state
      setDogs(prev => [...prev, createdDog]);
      
      toast({
        title: "Dog Added",
        description: `${createdDog.name} has been added to your dogs.`
      });
      
      return createdDog;
    } catch (err) {
      console.error('Error adding dog:', err);
      setError(err as Error);
      
      toast({
        title: "Error",
        description: `Failed to add dog: ${(err as Error).message}`,
        variant: "destructive"
      });
      
      return null;
    }
  };

  // Update an existing dog
  const updateDog = async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    try {
      if (!user) throw new Error('User must be logged in to update a dog');
      
      // Format dog data for update
      const dogUpdates: any = {};
      
      if (updates.name) dogUpdates.name = updates.name;
      if (updates.breed) dogUpdates.breed = updates.breed;
      if (updates.gender) dogUpdates.gender = updates.gender;
      if (updates.color) dogUpdates.color = updates.color;
      if (updates.dateOfBirth) dogUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.registrationNumber !== undefined) dogUpdates.registration_number = updates.registrationNumber;
      if (updates.dewormingDate !== undefined) dogUpdates.deworming_date = updates.dewormingDate;
      if (updates.vaccinationDate !== undefined) dogUpdates.vaccination_date = updates.vaccinationDate;
      if (updates.notes !== undefined) dogUpdates.notes = updates.notes;
      if (updates.image !== undefined) dogUpdates.image_url = updates.image;
      if (updates.heatInterval !== undefined) dogUpdates.heat_interval = updates.heatInterval;
      
      if (Object.keys(dogUpdates).length > 0) {
        // Update dog
        const { data, error } = await supabase
          .from('dogs')
          .update(dogUpdates)
          .eq('id', id)
          .select()
          .single();
  
        if (error) throw error;
        
        // Handle heat history updates for female dogs
        if (updates.gender === 'female' && updates.heatHistory) {
          // First delete existing heat records
          const { error: deleteError } = await supabase
            .from('heat_records')
            .delete()
            .eq('dog_id', id);
            
          if (deleteError) throw deleteError;
          
          // Then insert new heat records
          if (updates.heatHistory.length > 0) {
            const heatRecords = updates.heatHistory.map(record => ({
              dog_id: id,
              date: record.date
            }));
            
            const { error: insertError } = await supabase
              .from('heat_records')
              .insert(heatRecords);
              
            if (insertError) throw insertError;
          }
        }
        
        // Format the updated dog
        const updatedDog: Dog = {
          ...dogs.find(d => d.id === id)!,
          ...updates,
          id: data.id,
          name: data.name,
          breed: data.breed,
          gender: data.gender,
          color: data.color,
          dateOfBirth: data.date_of_birth,
          registrationNumber: data.registration_number,
          dewormingDate: data.deworming_date,
          vaccinationDate: data.vaccination_date,
          notes: data.notes,
          image: data.image_url,
          heatInterval: data.heat_interval,
          user_id: data.user_id
        };
        
        // Update local state
        setDogs(prev => prev.map(dog => dog.id === id ? updatedDog : dog));
        
        // If we're updating the active dog, update it too
        if (activeDog && activeDog.id === id) {
          setActiveDog(updatedDog);
        }
        
        toast({
          title: "Dog Updated",
          description: `${updatedDog.name}'s information has been updated.`
        });
        
        return updatedDog;
      }
      
      return dogs.find(d => d.id === id) || null;
    } catch (err) {
      console.error('Error updating dog:', err);
      setError(err as Error);
      
      toast({
        title: "Error",
        description: `Failed to update dog: ${(err as Error).message}`,
        variant: "destructive"
      });
      
      return null;
    }
  };

  // Delete a dog
  const deleteDog = async (id: string): Promise<boolean> => {
    try {
      if (!user) throw new Error('User must be logged in to delete a dog');
      
      // Delete dog
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setDogs(prev => prev.filter(dog => dog.id !== id));
      
      // Clear active dog if it's the one being deleted
      if (activeDog && activeDog.id === id) {
        setActiveDog(null);
      }
      
      toast({
        title: "Dog Deleted",
        description: "The dog has been deleted from your records."
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting dog:', err);
      setError(err as Error);
      
      toast({
        title: "Error",
        description: `Failed to delete dog: ${(err as Error).message}`,
        variant: "destructive"
      });
      
      return false;
    }
  };

  return (
    <DogsContext.Provider
      value={{
        dogs,
        loading,
        error,
        addDog,
        updateDog,
        deleteDog,
        activeDog,
        setActiveDog
      }}
    >
      {children}
    </DogsContext.Provider>
  );
}

export function useDogs() {
  const context = useContext(DogsContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
}
