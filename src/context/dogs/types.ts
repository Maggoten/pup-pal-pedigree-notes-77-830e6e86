
import { Dog, HeatRecord } from '@/types/dogs';

export interface SupabaseDogContextType {
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
  refreshDogs: () => Promise<boolean>;
  
  // Adding the missing properties to align with component usage
  isUpdatingDog: boolean;
  isDeletingDog: boolean;
  isAddingDog: boolean;
  updateDog: (id: string, data: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string, dogName: string) => Promise<boolean>;
  fetchDogHeatRecords: (dogId: string) => any;
  addHeatRecord: (dogId: string, date: Date) => Promise<boolean>;
  deleteHeatRecord: (id: string) => Promise<boolean>;
  isLoading: boolean;
}
