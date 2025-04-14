
import { toast } from '@/components/ui/use-toast';
import { Dog } from '@/types/dogs';
import { 
  fetchDogs, 
  createDog, 
  updateDog, 
  deleteDog, 
  fetchHeatRecords,
  addHeatRecord,
  deleteHeatRecord
} from '@/services/dogs';

// Dog operations
export const loadDogs = async () => {
  try {
    const dogsData = await fetchDogs();
    console.log("Loaded dogs:", dogsData);
    return { dogs: dogsData, error: null };
  } catch (err) {
    console.error(err);
    return { dogs: [], error: 'Failed to load dogs' };
  }
};

export const refreshDogsList = async (activeDogId?: string) => {
  console.log("Refreshing dogs list...");
  try {
    const updatedDogList = await fetchDogs();
    
    // If there's an active dog ID, find its updated data
    let refreshedActiveDog = null;
    if (activeDogId) {
      refreshedActiveDog = updatedDogList.find(d => d.id === activeDogId);
      if (!refreshedActiveDog) {
        console.log("Active dog no longer found in the updated list");
      } else {
        console.log("Updated active dog with fresh data:", refreshedActiveDog);
      }
    }
    
    return { 
      success: true, 
      dogs: updatedDogList, 
      activeDog: refreshedActiveDog 
    };
  } catch (error) {
    console.error("Error refreshing dogs:", error);
    toast({
      title: "Error",
      description: "Failed to refresh dogs. Please try again.",
      variant: "destructive",
    });
    return { success: false };
  }
};

export const addNewDog = async (dog: Omit<Dog, "id">) => {
  try {
    const newDog = await createDog(dog);
    if (newDog) {
      return { success: true, dog: newDog };
    }
    return { success: false, error: "Failed to add dog" };
  } catch (error) {
    console.error("Error adding dog:", error);
    toast({
      title: "Error",
      description: "Failed to add dog. Please try again.",
      variant: "destructive",
    });
    return { success: false, error: "Failed to add dog" };
  }
};

export const removeDog = async (id: string, dogName: string) => {
  try {
    const success = await deleteDog(id, dogName);
    return { success };
  } catch (error) {
    console.error("Error removing dog:", error);
    toast({
      title: "Error",
      description: "Failed to remove dog. Please try again.",
      variant: "destructive",
    });
    return { success: false };
  }
};

export const updateDogInfo = async (id: string, data: Partial<Dog>) => {
  console.log("Updating dog in context:", id, data);
  try {
    const updatedDog = await updateDog(id, data);
    
    if (updatedDog) {
      console.log("Dog updated successfully:", updatedDog);
      return { success: true, dog: updatedDog };
    }
    
    console.log("Failed to update dog");
    return { success: false };
  } catch (error) {
    console.error("Error updating dog info:", error);
    toast({
      title: "Error",
      description: "Failed to update dog information. Please try again.",
      variant: "destructive",
    });
    return { success: false };
  }
};

// Heat record operations
export const loadHeatRecords = async (dogId: string) => {
  try {
    const records = await fetchHeatRecords(dogId);
    return { success: true, records };
  } catch (err) {
    console.error('Failed to load heat records', err);
    toast({
      title: "Error",
      description: "Failed to load heat records. Please try again.",
      variant: "destructive",
    });
    return { success: false, records: [] };
  }
};

export const addHeatDate = async (dogId: string, date: Date) => {
  try {
    const success = await addHeatRecord(dogId, date);
    return { success };
  } catch (error) {
    console.error("Error adding heat date:", error);
    toast({
      title: "Error",
      description: "Failed to add heat date. Please try again.",
      variant: "destructive",
    });
    return { success: false };
  }
};

export const removeHeatDate = async (id: string) => {
  try {
    const success = await deleteHeatRecord(id);
    return { success };
  } catch (error) {
    console.error("Error removing heat date:", error);
    toast({
      title: "Error",
      description: "Failed to remove heat date. Please try again.",
      variant: "destructive",
    });
    return { success: false };
  }
};
