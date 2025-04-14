
import React, { useState } from 'react';
import { Dog } from '@/types/dogs';
import { useDogs } from '@/hooks/useDogs';
import { format } from 'date-fns';
import { DogFormValues } from './schema/dogFormSchema';
import DogDetailsHeader from './components/DogDetailsHeader';
import DogDetailsCard from './components/DogDetailsCard';
import DeleteDogDialog from './components/DeleteDogDialog';
import { toast } from '@/components/ui/use-toast';

interface DogDetailsProps {
  dog: Dog;
  onBack: () => void;
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog, onBack }) => {
  const { updateDog, deleteDog, isUpdatingDog, isDeletingDog, refreshDogs } = useDogs();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleSave = async (values: DogFormValues) => {
    try {
      console.log("Saving dog with values:", values);
      
      // Format dates for database
      const formattedValues = {
        name: values.name,
        breed: values.breed,
        dateOfBirth: values.dateOfBirth ? format(values.dateOfBirth, 'yyyy-MM-dd') : '',
        gender: values.gender,
        color: values.color,
        registrationNumber: values.registrationNumber,
        dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : null,
        vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : null,
        notes: values.notes,
        image_url: values.image, // Pass the image URL to be handled in the service
        heatInterval: values.heatInterval,
      };
      
      console.log("Formatted values for Supabase:", formattedValues);
      
      await updateDog(dog.id, formattedValues);
      toast({
        title: "Success",
        description: "Dog information updated successfully",
      });
      
      await refreshDogs();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving dog information:", error);
      toast({
        title: "Error",
        description: "Failed to update dog information",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    await deleteDog(dog.id, dog.name);
    onBack();
  };

  return (
    <div className="space-y-6">
      <DogDetailsHeader 
        onBack={onBack} 
        isEditing={isEditing} 
      />
      
      <DogDetailsCard
        dog={dog}
        isEditing={isEditing}
        isDeletingDog={isDeletingDog}
        isUpdatingDog={isUpdatingDog}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onSave={handleSave}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <DeleteDogDialog
        dogName={dog.name}
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeletingDog}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};

export default DogDetails;
