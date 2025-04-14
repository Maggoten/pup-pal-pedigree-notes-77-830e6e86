
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addDog: (dog: Dog) => void;
  removeDog: (id: string) => void;
  updateDog: (id: string, data: Partial<Dog>) => void;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
}

const DogsContext = createContext<DogsContextType | undefined>(undefined);

// Sample data
const initialDogs: Dog[] = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    gender: 'male',
    dateOfBirth: '2020-05-15',
    color: 'Golden',
    registrationNumber: 'AKC123456',
    image: '/placeholder.svg',
    notes: 'Champion bloodline, excellent temperament',
    dewormingDate: '2023-03-20',
    vaccinationDate: '2023-01-15',
    health: {
      vaccinations: [
        { name: 'Rabies', date: '2023-01-15' },
        { name: 'DHPP', date: '2023-01-15' }
      ],
      medicalIssues: []
    },
    breedingHistory: {
      matings: [
        { partner: 'Bella', date: '2023-02-10', successful: true }
      ],
      litters: [
        { date: '2023-04-15', puppies: 6, notes: 'All healthy' }
      ]
    }
  },
  {
    id: '2',
    name: 'Bella',
    breed: 'Golden Retriever',
    gender: 'female',
    dateOfBirth: '2021-03-20',
    color: 'Light Golden',
    registrationNumber: 'AKC789012',
    image: '/placeholder.svg',
    notes: 'Excellent mother, calm disposition',
    dewormingDate: '2023-03-25',
    vaccinationDate: '2023-01-20',
    heatHistory: [
      { date: '2023-04-10' },
      { date: '2023-10-15' }
    ],
    heatInterval: 180,
    health: {
      vaccinations: [
        { name: 'Rabies', date: '2023-01-20' },
        { name: 'DHPP', date: '2023-01-20' }
      ],
      medicalIssues: []
    },
    breedingHistory: {
      matings: [
        { partner: 'Max', date: '2023-02-10', successful: true }
      ],
      litters: [
        { date: '2023-04-15', puppies: 6, notes: 'All healthy' }
      ]
    }
  },
  {
    id: '3',
    name: 'Rocky',
    breed: 'German Shepherd',
    gender: 'male',
    dateOfBirth: '2019-11-10',
    color: 'Black and Tan',
    registrationNumber: 'AKC345678',
    image: '/placeholder.svg',
    notes: 'Working line, excellent structure',
    dewormingDate: '2023-04-01',
    vaccinationDate: '2023-02-01',
    health: {
      vaccinations: [
        { name: 'Rabies', date: '2023-02-01' },
        { name: 'DHPP', date: '2023-02-01' }
      ],
      medicalIssues: []
    }
  }
];

export const DogsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>(initialDogs);
  const [activeDog, setActiveDog] = useState<Dog | null>(null);

  const addDog = (dog: Dog) => {
    setDogs([...dogs, dog]);
  };

  const removeDog = (id: string) => {
    setDogs(dogs.filter(dog => dog.id !== id));
  };

  const updateDog = (id: string, data: Partial<Dog>) => {
    setDogs(dogs.map(dog => dog.id === id ? { ...dog, ...data } : dog));
    
    // If we're updating the active dog, update it too
    if (activeDog && activeDog.id === id) {
      setActiveDog({ ...activeDog, ...data });
    }
  };

  return (
    <DogsContext.Provider value={{ dogs, addDog, removeDog, updateDog, activeDog, setActiveDog }}>
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
