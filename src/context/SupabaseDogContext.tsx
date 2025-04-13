
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  fetchDogs, 
  createDog, 
  updateDog, 
  deleteDog, 
  fetchHeatRecords,
  addHeatRecord,
  deleteHeatRecord,
  uploadDogImage
} from '@/services/dogs';
import { Dog, HeatRecord } from '@/types/dogs';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseDogContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  addDog: (dog: Omit<Dog, "id">) => Promise<Dog | null>;
  removeDog: (id: string, dogName: string) => Promise<boolean>;
  updateDogInfo: (id: string, data: Partial<Dog>) => Promise<Dog | null>;
  uploadImage: (file: File, dogId: string) => Promise<string | null>;
  heatRecords: HeatRecord[];
  loadHeatRecords: (dogId: string) => Promise<void>;
  addHeatDate: (dogId: string, date: Date) => Promise<boolean>;
  removeHeatDate: (id: string) => Promise<boolean>;
  refreshDogs: () => Promise<void>;
}

const SupabaseDogContext = createContext<SupabaseDogContextType | undefined>(undefined);

export const SupabaseDogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  const [heatRecords, setHeatRecords] = useState<HeatRecord[]>([]);

  // Check for authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Reload dogs when user logs in or out
      if (event === 'SIGNED_IN') {
        loadDogs();
      } else if (event === 'SIGNED_OUT') {
        setDogs([]);
        setActiveDog(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load dogs on initial mount
  useEffect(() => {
    loadDogs();
  }, []);

  const loadDogs = async () => {
    try {
      setLoading(true);
      const dogsData = await fetchDogs();
      setDogs(dogsData);
      setError(null);
    } catch (err) {
      setError('Failed to load dogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHeatRecords = async (dogId: string) => {
    try {
      const records = await fetchHeatRecords(dogId);
      setHeatRecords(records);
    } catch (err) {
      console.error('Failed to load heat records', err);
    }
  };

  const addDog = async (dog: Omit<Dog, "id">) => {
    const newDog = await createDog(dog);
    if (newDog) {
      setDogs(prev => [...prev, newDog]);
    }
    return newDog;
  };

  const removeDog = async (id: string, dogName: string) => {
    const success = await deleteDog(id, dogName);
    if (success) {
      setDogs(prev => prev.filter(dog => dog.id !== id));
      if (activeDog && activeDog.id === id) {
        setActiveDog(null);
      }
    }
    return success;
  };

  const updateDogInfo = async (id: string, data: Partial<Dog>) => {
    console.log("Updating dog in context:", id, data);
    const updatedDog = await updateDog(id, data);
    
    if (updatedDog) {
      console.log("Dog updated successfully:", updatedDog);
      // Update dogs list
      setDogs(prev => prev.map(dog => dog.id === id ? updatedDog : dog));
      
      // Update active dog if it's the one being edited
      if (activeDog && activeDog.id === id) {
        setActiveDog(updatedDog);
      }
      
      return updatedDog;
    }
    
    console.log("Failed to update dog");
    return null;
  };

  const addHeatDate = async (dogId: string, date: Date) => {
    const success = await addHeatRecord(dogId, date);
    if (success) {
      // Reload heat records
      await loadHeatRecords(dogId);
    }
    return success;
  };

  const removeHeatDate = async (id: string) => {
    const success = await deleteHeatRecord(id);
    if (success && activeDog) {
      // Reload heat records
      await loadHeatRecords(activeDog.id);
    }
    return success;
  };

  const uploadImage = async (file: File, dogId: string) => {
    return await uploadDogImage(file, dogId);
  };

  const refreshDogs = async () => {
    await loadDogs();
  };

  return (
    <SupabaseDogContext.Provider value={{
      dogs,
      loading,
      error,
      activeDog,
      setActiveDog,
      addDog,
      removeDog,
      updateDogInfo,
      uploadImage,
      heatRecords,
      loadHeatRecords,
      addHeatDate,
      removeHeatDate,
      refreshDogs
    }}>
      {children}
    </SupabaseDogContext.Provider>
  );
};

export const useSupabaseDogs = () => {
  const context = useContext(SupabaseDogContext);
  if (context === undefined) {
    throw new Error('useSupabaseDogs must be used within a SupabaseDogProvider');
  }
  return context;
};
