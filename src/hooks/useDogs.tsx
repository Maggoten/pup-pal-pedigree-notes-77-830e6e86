import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dog } from '@/types/dogs';
import { 
  fetchDogs,
  fetchDogById,
  createDog,
  updateDog,
  deleteDog,
  fetchHeatRecords,
  addHeatRecord,
  deleteHeatRecord
} from '@/services/dogs';
import { toast } from '@/components/ui/use-toast';

export const useDogs = () => {
  const queryClient = useQueryClient();
  
  const { 
    data: dogs = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['dogs'],
    queryFn: fetchDogs
  });
  
  const { mutate: addDog, isPending: isAddingDog } = useMutation({
    mutationFn: createDog,
    onSuccess: (newDog) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      toast({
        title: "Success",
        description: `${newDog.name} has been added to your dogs.`,
      });
    },
    onError: (error) => {
      console.error('Error adding dog:', error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const { mutate: updateDogInfo, isPending: isUpdatingDog } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dog> }) => 
      updateDog(id, data),
    onSuccess: (updatedDog) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      toast({
        title: "Success",
        description: `${updatedDog.name} has been updated.`,
      });
    },
    onError: (error) => {
      console.error('Error updating dog:', error);
      toast({
        title: "Error",
        description: "Failed to update dog. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const { mutate: removeDog, isPending: isDeletingDog } = useMutation({
    mutationFn: ({ id, dogName }: { id: string; dogName: string }) => 
      deleteDog(id, dogName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      toast({
        title: "Success",
        description: `${variables.dogName} has been removed from your dogs.`,
      });
    },
    onError: (error) => {
      console.error('Error removing dog:', error);
      toast({
        title: "Error",
        description: "Failed to remove dog. Please try again.",
        variant: "destructive",
      });
    }
  });

  const fetchDogHeatRecords = (dogId: string) => {
    const { data = [], isLoading } = useQuery({
      queryKey: ['heatRecords', dogId],
      queryFn: () => fetchHeatRecords(dogId),
      enabled: !!dogId,
    });
    
    return { data, isLoading };
  };
  
  const { mutate: addHeatDate } = useMutation({
    mutationFn: ({ dogId, date }: { dogId: string; date: Date }) => 
      addHeatRecord(dogId, date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['heatRecords', variables.dogId] });
      toast({
        title: "Success",
        description: "Heat record added successfully.",
      });
    }
  });
  
  const { mutate: removeHeatDate } = useMutation({
    mutationFn: (id: string) => deleteHeatRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heatRecords'] });
      toast({
        title: "Success",
        description: "Heat record removed successfully.",
      });
    }
  });
  
  const refreshDogs = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dogs'] });
    return true;
  };
  
  return {
    dogs,
    isLoading,
    error,
    
    addDog: (dog: Omit<Dog, "id">) => addDog(dog),
    isAddingDog,
    
    updateDog: (id: string, data: Partial<Dog>) => updateDogInfo({ id, data }),
    updateDogInfo: (id: string, data: Partial<Dog>) => updateDogInfo({ id, data }),
    isUpdatingDog,
    
    deleteDog: (id: string, dogName: string) => removeDog({ id, dogName }),
    removeDog: (id: string, dogName: string) => removeDog({ id, dogName }),
    isDeletingDog,
    
    fetchDogHeatRecords,
    addHeatDate: (dogId: string, date: Date) => addHeatDate({ dogId, date }),
    removeHeatDate,
    addHeatRecord: (dogId: string, date: Date) => addHeatDate({ dogId, date }),
    deleteHeatRecord: (id: string) => removeHeatDate(id),
    
    refreshDogs,
    
    loading: isLoading,
    activeDog: null,
    setActiveDog: () => {},
    uploadImage: async () => null,
    heatRecords: [],
    loadHeatRecords: async () => ({ data: [], isLoading: false })
  };
};

export { useDogs as useSupabaseDogs };
