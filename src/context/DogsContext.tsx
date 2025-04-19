import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dog } from '@/types/dogs';
import * as dogService from '@/services/dogService';
import { useUser } from '@/hooks/useUser';

interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog | null>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string) => Promise<boolean>;
  refreshDogs: () => Promise<void>;
}

const DogsContext = createContext<DogsContextType | undefined>(undefined);

export const DogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fetchDogs = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await dogService.fetchDogs(user.id);
      setDogs(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [user?.id]);

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): Promise<Dog | null> => {
    if (!user?.id) return null;
    setLoading(true);
    try {
      const newDog = await dogService.addDog(dog, user.id);
      setDogs((prev) => [newDog, ...prev]);
      return newDog;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDog = async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    setLoading(true);
    try {
      const updated = await dogService.updateDog(id, updates);
      if (updated) {
        setDogs((prev) =>
          prev.map((dog) => (dog.id === id ? updated : dog))
        );
      }
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDog = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await dogService.deleteDog(id);
      if (success) {
        setDogs((prev) => prev.filter((dog) => dog.id !== id));
      }
      return success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
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
        refreshDogs: fetchDogs,
      }}
    >
      {children}
    </DogsContext.Provider>
  );
};

export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  if (!context) {
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
};
