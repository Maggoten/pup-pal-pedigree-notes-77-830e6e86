
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
import { toast } from '@/components/ui/use-toast';

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
    try {
      const updatedDogList = await fetchDogs();
      dispatch({ type: 'SET_DOGS', payload: updatedDogList });
      
      // If there's an active dog, we need to refresh its data too
      if (state.activeDog) {
        const refreshedDog = updatedDogList.find(d => d.id === state.activeDog?.id);
        if (refreshedDog) {
          console.log("Updating active dog with fresh data:", refreshedDog);
          dispatch({ type: 'SET_ACTIVE_DOG', payload: refreshedDog });
        } else {
          console.log("Active dog no longer found in the updated list");
          dispatch({ type: 'SET_ACTIVE_DOG', payload: null });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error refreshing dogs:", error);
      toast({
        title: "Error",
        description: "Failed to refresh dogs. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.activeDog]);

  const loadHeatRecords = async (dogId: string) => {
    try {
      const records = await fetchHeatRecords(dogId);
      dispatch({ type: 'SET_HEAT_RECORDS', payload: records });
    } catch (err) {
      console.error('Failed to load heat records', err);
      toast({
        title: "Error",
        description: "Failed to load heat records. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addDog = async (dog: Omit<Dog, "id">) => {
    try {
      const newDog = await createDog(dog);
      if (newDog) {
        dispatch({ type: 'ADD_DOG', payload: newDog });
      }
      return newDog;
    } catch (error) {
      console.error("Error adding dog:", error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeDog = async (id: string, dogName: string) => {
    try {
      const success = await deleteDog(id, dogName);
      if (success) {
        dispatch({ type: 'REMOVE_DOG', payload: id });
      }
      return success;
    } catch (error) {
      console.error("Error removing dog:", error);
      toast({
        title: "Error",
        description: "Failed to remove dog. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDogInfo = async (id: string, data: Partial<Dog>) => {
    console.log("Updating dog in context:", id, data);
    try {
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
    } catch (error) {
      console.error("Error updating dog info:", error);
      toast({
        title: "Error",
        description: "Failed to update dog information. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const addHeatDate = async (dogId: string, date: Date) => {
    try {
      const success = await addHeatRecord(dogId, date);
      if (success) {
        // Reload heat records
        await loadHeatRecords(dogId);
      }
      return success;
    } catch (error) {
      console.error("Error adding heat date:", error);
      toast({
        title: "Error",
        description: "Failed to add heat date. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeHeatDate = async (id: string) => {
    try {
      const success = await deleteHeatRecord(id);
      if (success && state.activeDog) {
        // Reload heat records
        await loadHeatRecords(state.activeDog.id);
      }
      return success;
    } catch (error) {
      console.error("Error removing heat date:", error);
      toast({
        title: "Error",
        description: "Failed to remove heat date. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadImage = async (file: File, dogId: string) => {
    try {
      return await uploadDogImage(file, dogId);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }
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
