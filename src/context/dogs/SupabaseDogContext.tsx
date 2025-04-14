
import React, { createContext, useReducer, ReactNode, useEffect, useCallback, useState } from 'react';
import { Dog } from '@/types/dogs';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseDogContextType } from './types';
import { dogsReducer, initialDogsState } from './dogsReducer';
import { 
  loadDogs, 
  refreshDogsList, 
  addNewDog, 
  removeDog, 
  updateDogInfo,
  loadHeatRecords, 
  addHeatDate, 
  removeHeatDate 
} from './actions/dogActions';
import { uploadImage } from './actions/imageActions';

export const SupabaseDogContext = createContext<SupabaseDogContextType | undefined>(undefined);

export const SupabaseDogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dogsReducer, initialDogsState);
  const [isAddingDog, setIsAddingDog] = useState(false);
  const [isUpdatingDog, setIsUpdatingDog] = useState(false);
  const [isDeletingDog, setIsDeletingDog] = useState(false);
  
  // Check for authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Reload dogs when user logs in or out
      if (event === 'SIGNED_IN') {
        fetchInitialDogs();
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
    fetchInitialDogs();
  }, []);

  const fetchInitialDogs = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const result = await loadDogs();
    dispatch({ type: 'SET_DOGS', payload: result.dogs });
    dispatch({ type: 'SET_ERROR', payload: result.error });
    
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const refreshDogs = useCallback(async () => {
    const result = await refreshDogsList(state.activeDog?.id);
    
    if (result.success && result.dogs) {
      dispatch({ type: 'SET_DOGS', payload: result.dogs });
      
      if (state.activeDog && result.activeDog) {
        dispatch({ type: 'SET_ACTIVE_DOG', payload: result.activeDog });
      } else if (state.activeDog && !result.activeDog) {
        dispatch({ type: 'SET_ACTIVE_DOG', payload: null });
      }
    }
    
    return result.success;
  }, [state.activeDog]);

  const fetchDogHeatRecords = async (dogId: string) => {
    const result = await loadHeatRecords(dogId);
    
    if (result.success) {
      dispatch({ type: 'SET_HEAT_RECORDS', payload: result.records });
    }
    
    return {
      data: result.success ? result.records : [],
      isLoading: false
    };
  };

  const addDog = async (dog: Omit<Dog, "id">) => {
    setIsAddingDog(true);
    try {
      const result = await addNewDog(dog);
      
      if (result.success && result.dog) {
        dispatch({ type: 'ADD_DOG', payload: result.dog });
      }
      
      return result.dog;
    } finally {
      setIsAddingDog(false);
    }
  };

  const removeExistingDog = async (id: string, dogName: string) => {
    setIsDeletingDog(true);
    try {
      const result = await removeDog(id, dogName);
      
      if (result.success) {
        dispatch({ type: 'REMOVE_DOG', payload: id });
      }
      
      return result.success;
    } finally {
      setIsDeletingDog(false);
    }
  };

  const updateDogData = async (id: string, data: Partial<Dog>) => {
    setIsUpdatingDog(true);
    try {
      const result = await updateDogInfo(id, data);
      
      if (result.success && result.dog) {
        dispatch({ 
          type: 'UPDATE_DOG', 
          payload: { id, dog: result.dog } 
        });
      }
      
      return result.dog;
    } finally {
      setIsUpdatingDog(false);
    }
  };

  const addHeatDateRecord = async (dogId: string, date: Date) => {
    const result = await addHeatDate(dogId, date);
    
    if (result.success) {
      // Reload heat records
      await fetchDogHeatRecords(dogId);
    }
    
    return result.success;
  };

  const removeHeatDateRecord = async (id: string) => {
    const result = await removeHeatDate(id);
    
    if (result.success && state.activeDog) {
      // Reload heat records
      await fetchDogHeatRecords(state.activeDog.id);
    }
    
    return result.success;
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
      removeDog: removeExistingDog,
      updateDogInfo: updateDogData,
      uploadImage,
      heatRecords: state.heatRecords,
      loadHeatRecords: fetchDogHeatRecords,
      addHeatDate: addHeatDateRecord,
      removeHeatDate: removeHeatDateRecord,
      refreshDogs,
      // Add aliases for existing functions to match component usage
      updateDog: updateDogData,
      deleteDog: removeExistingDog,
      fetchDogHeatRecords,
      addHeatRecord: addHeatDateRecord,
      deleteHeatRecord: removeHeatDateRecord,
      // Add state variables for loading states
      isAddingDog,
      isUpdatingDog,
      isDeletingDog,
      isLoading: state.loading
    }}>
      {children}
    </SupabaseDogContext.Provider>
  );
};
