
import React, { createContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
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
import { Dog } from '@/types/dogs';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseDogContextType } from './types';
import { dogsReducer, initialDogsState } from './dogsReducer';

export const SupabaseDogContext = createContext<SupabaseDogContextType | undefined>(undefined);

export const SupabaseDogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dogsReducer, initialDogsState);
  
  // Check for authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Reload dogs when user logs in or out
      if (event === 'SIGNED_IN') {
        loadDogs();
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_DOGS', payload: [] });
        dispatch({ type: 'SET_ACTIVE_DOG', payload: null });
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
      dispatch({ type: 'SET_LOADING', payload: true });
      const dogsData = await fetchDogs();
      console.log("Loaded dogs:", dogsData);
      dispatch({ type: 'SET_DOGS', payload: dogsData });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dogs' });
      console.error(err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshDogs = useCallback(async () => {
    console.log("Refreshing dogs list...");
    await loadDogs();
    
    // If there's an active dog, we need to refresh its data too
    if (state.activeDog) {
      const updatedDogList = await fetchDogs();
      const refreshedDog = updatedDogList.find(d => d.id === state.activeDog?.id);
      if (refreshedDog) {
        console.log("Updating active dog with fresh data:", refreshedDog);
        dispatch({ type: 'SET_ACTIVE_DOG', payload: refreshedDog });
      }
    }
  }, [state.activeDog]);

  const loadHeatRecords = async (dogId: string) => {
    try {
      const records = await fetchHeatRecords(dogId);
      dispatch({ type: 'SET_HEAT_RECORDS', payload: records });
    } catch (err) {
      console.error('Failed to load heat records', err);
    }
  };

  const addDog = async (dog: Omit<Dog, "id">) => {
    const newDog = await createDog(dog);
    if (newDog) {
      dispatch({ type: 'ADD_DOG', payload: newDog });
    }
    return newDog;
  };

  const removeDog = async (id: string, dogName: string) => {
    const success = await deleteDog(id, dogName);
    if (success) {
      dispatch({ type: 'REMOVE_DOG', payload: id });
    }
    return success;
  };

  const updateDogInfo = async (id: string, data: Partial<Dog>) => {
    console.log("Updating dog in context:", id, data);
    const updatedDog = await updateDog(id, data);
    
    if (updatedDog) {
      console.log("Dog updated successfully:", updatedDog);
      dispatch({ 
        type: 'UPDATE_DOG', 
        payload: { id, dog: updatedDog } 
      });
      
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
    if (success && state.activeDog) {
      // Reload heat records
      await loadHeatRecords(state.activeDog.id);
    }
    return success;
  };

  const uploadImage = async (file: File, dogId: string) => {
    return await uploadDogImage(file, dogId);
  };

  const setActiveDog = (dog: Dog | null) => {
    dispatch({ type: 'SET_ACTIVE_DOG', payload: dog });
  };

  return (
    <SupabaseDogContext.Provider value={{
      dogs: state.dogs,
      loading: state.loading,
      error: state.error,
      activeDog: state.activeDog,
      setActiveDog,
      addDog,
      removeDog,
      updateDogInfo,
      uploadImage,
      heatRecords: state.heatRecords,
      loadHeatRecords,
      addHeatDate,
      removeHeatDate,
      refreshDogs
    }}>
      {children}
    </SupabaseDogContext.Provider>
  );
};
