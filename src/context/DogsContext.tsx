
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Define proper types for a dog
export interface Dog {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  color: string;
  image?: string;
  vaccinationDate?: string;
  dewormingDate?: string;
  registration_number?: string;
  notes?: string;
  breedingHistory?: {
    matings?: {
      id: string;
      date: string;
      partnerId?: string;
      partnerName?: string;
      successful: boolean;
    }[];
    litters?: {
      id: string;
      date: string;
      puppies: number;
    }[];
  };
}

// Sample data - this would come from an API in a real app
const sampleDogs: Dog[] = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    gender: 'male',
    dateOfBirth: '2020-03-15',
    color: 'Golden',
    image: '/lovable-uploads/0c5301cf-baab-4805-bd48-3354b6664483.png',
    vaccinationDate: '2024-02-10',
    dewormingDate: '2024-03-01',
    registration_number: 'AKC123456',
    notes: 'Friendly and well-trained',
    breedingHistory: {
      matings: [
        {
          id: 'm1',
          date: '2023-06-15',
          partnerName: 'Bella',
          successful: true
        }
      ]
    }
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'German Shepherd',
    gender: 'female',
    dateOfBirth: '2021-05-20',
    color: 'Black and Tan',
    image: '/lovable-uploads/15be06f0-e9ee-449e-911e-078b98f91a34.png',
    vaccinationDate: '2024-01-15',
    dewormingDate: '2024-02-20',
    registration_number: 'AKC789012',
    notes: 'Excellent temperament',
    breedingHistory: {
      matings: [
        {
          id: 'm2',
          date: '2023-07-10',
          partnerName: 'Rex',
          successful: true
        }
      ],
      litters: [
        {
          id: 'l1',
          date: '2023-09-05',
          puppies: 6
        }
      ]
    }
  },
  {
    id: '3',
    name: 'Buddy',
    breed: 'Labrador Retriever',
    gender: 'male',
    dateOfBirth: '2019-12-10',
    color: 'Chocolate',
    vaccinationDate: '2024-03-01',
    dewormingDate: '2024-03-15',
    registration_number: 'AKC345678',
    notes: 'Loves water activities'
  }
];

// Context type
interface DogsContextType {
  dogs: Dog[];
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  addDog: (dog: Dog) => void;
  updateDog: (updatedDog: Dog) => void;
  deleteDog: (dogId: string) => void;
}

// Create the context
const DogsContext = createContext<DogsContextType | undefined>(undefined);

// Provider component
export const DogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>(sampleDogs);
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  
  // Add a dog
  const addDog = (dog: Dog) => {
    setDogs([...dogs, dog]);
  };
  
  // Update a dog
  const updateDog = (updatedDog: Dog) => {
    setDogs(dogs.map(dog => dog.id === updatedDog.id ? updatedDog : dog));
  };
  
  // Delete a dog
  const deleteDog = (dogId: string) => {
    setDogs(dogs.filter(dog => dog.id !== dogId));
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    dogs,
    activeDog,
    setActiveDog,
    addDog,
    updateDog,
    deleteDog
  }), [dogs, activeDog]);
  
  return (
    <DogsContext.Provider value={contextValue}>
      {children}
    </DogsContext.Provider>
  );
};

// Hook to use the context
export const useDogs = () => {
  const context = useContext(DogsContext);
  if (context === undefined) {
    console.warn('useDogs must be used within a DogsProvider - returning default values');
    return {
      dogs: [],
      activeDog: null,
      setActiveDog: () => {},
      addDog: () => {},
      updateDog: () => {},
      deleteDog: () => {}
    };
  }
  return context;
};
