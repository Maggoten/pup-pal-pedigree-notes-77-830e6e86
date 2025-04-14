
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
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
import { toast } from '@/components/ui/use-toast';

export const useDogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch all dogs
  const { 
    data: dogs = [], 
    isLoading,
    error,
    refetch: refreshDogs
  } = useQuery({
    queryKey: ['dogs'],
    queryFn: fetchDogs,
    enabled: !!user,
  });
  
  // Get a specific dog by ID
  const getDogById = (id: string) => {
    return dogs.find(dog => dog.id === id) || null;
  };
  
  // Fetch heat records for a dog
  const fetchDogHeatRecords = (dogId: string) => {
    return useQuery({
      queryKey: ['dogHeatRecords', dogId],
      queryFn: () => fetchHeatRecords(dogId),
      enabled: !!dogId,
    });
  };
  
  // Add a new dog
  const addDogMutation = useMutation({
    mutationFn: (dog: Omit<Dog, "id">) => createDog(dog),
    onSuccess: (newDog) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      if (newDog) {
        toast({
          title: "Success",
          description: `${newDog.name} has been added to your dogs.`,
        });
      }
    },
    onError: (error) => {
      console.error("Error adding dog:", error);
      toast({
        title: "Failed to add dog",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Update an existing dog
  const updateDogMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dog> }) => updateDog(id, data),
    onSuccess: (updatedDog) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      if (updatedDog) {
        toast({
          title: "Success",
          description: `${updatedDog.name}'s information has been updated.`,
        });
      }
    },
    onError: (error) => {
      console.error("Error updating dog:", error);
      toast({
        title: "Failed to update dog",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Delete a dog
  const deleteDogMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => deleteDog(id, name),
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['dogs'] });
        toast({
          title: "Success",
          description: `${variables.name} has been removed.`,
        });
      }
    },
    onError: (error) => {
      console.error("Error deleting dog:", error);
      toast({
        title: "Failed to delete dog",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Add heat record
  const addHeatRecordMutation = useMutation({
    mutationFn: ({ dogId, date }: { dogId: string; date: Date }) => addHeatRecord(dogId, date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dogHeatRecords', variables.dogId] });
      toast({
        title: "Success",
        description: "Heat record has been added.",
      });
    },
    onError: (error) => {
      console.error("Error adding heat record:", error);
      toast({
        title: "Failed to add heat record",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Delete heat record
  const deleteHeatRecordMutation = useMutation({
    mutationFn: (recordId: string) => deleteHeatRecord(recordId),
    onSuccess: () => {
      // We need to invalidate all heat records as we don't know the dog ID here
      queryClient.invalidateQueries({ queryKey: ['dogHeatRecords'] });
      toast({
        title: "Success",
        description: "Heat record has been removed.",
      });
    },
    onError: (error) => {
      console.error("Error deleting heat record:", error);
      toast({
        title: "Failed to delete heat record",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Upload image
  const uploadImageMutation = useMutation({
    mutationFn: ({ file, dogId }: { file: File; dogId: string }) => uploadDogImage(file, dogId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    },
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast({
        title: "Failed to upload image",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  return {
    // Data
    dogs,
    isLoading,
    error,
    
    // Actions
    addDog: (dog: Omit<Dog, "id">) => addDogMutation.mutate(dog),
    updateDog: (id: string, data: Partial<Dog>) => updateDogMutation.mutate({ id, data }),
    deleteDog: (id: string, name: string) => deleteDogMutation.mutate({ id, name }),
    getDogById,
    fetchDogHeatRecords,
    addHeatRecord: (dogId: string, date: Date) => addHeatRecordMutation.mutate({ dogId, date }),
    deleteHeatRecord: (id: string) => deleteHeatRecordMutation.mutate(id),
    uploadImage: (file: File, dogId: string) => uploadImageMutation.mutate({ file, dogId }),
    refreshDogs,
    
    // Status
    isAddingDog: addDogMutation.isPending,
    isUpdatingDog: updateDogMutation.isPending,
    isDeletingDog: deleteDogMutation.isPending,
    isAddingHeatRecord: addHeatRecordMutation.isPending,
    isDeletingHeatRecord: deleteHeatRecordMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending
  };
};
