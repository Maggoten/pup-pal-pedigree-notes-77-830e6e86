
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { useDogs } from '@/context/DogsContext';
import { DogFormValues } from './DogFormFields';
import { toast } from '@/hooks/use-toast';
import DeleteDogDialog from './delete-dialog/DeleteDogDialog';
import DogDetailsCard from './details/DogDetailsCard';
import DogActions from './actions/DogActions';

interface DogDetailsProps {
  dog: Dog;
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog }) => {
  const { setActiveDog, updateDog, removeDog, loading } = useDogs();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const handleBack = () => {
    setActiveDog(null);
  };

  const handleSave = async (values: DogFormValues) => {
    setLastError(null);
    setIsSaving(true);
    
    try {
      const updates: Partial<Dog> = {};
      
      if (values.name !== dog.name) updates.name = values.name;
      if (values.breed !== dog.breed) updates.breed = values.breed;
      if (values.gender !== dog.gender) updates.gender = values.gender;
      if (values.color !== dog.color) updates.color = values.color;
      if (values.notes !== dog.notes) updates.notes = values.notes;
      if (values.registrationNumber !== dog.registrationNumber) {
        updates.registrationNumber = values.registrationNumber;
      }
      if (values.image !== dog.image) updates.image = values.image;
      
      // Update the date of birth if changed
      const newDateOfBirth = values.dateOfBirth.toISOString().split('T')[0];
      if (newDateOfBirth !== dog.dateOfBirth) {
        updates.dateOfBirth = newDateOfBirth;
      }
      
      if (values.dewormingDate) {
        const newDewormingDate = values.dewormingDate.toISOString().split('T')[0];
        if (newDewormingDate !== dog.dewormingDate) {
          updates.dewormingDate = newDewormingDate;
        }
      } else if (dog.dewormingDate) {
        updates.dewormingDate = null as any;
      }
      
      if (values.vaccinationDate) {
        const newVaccinationDate = values.vaccinationDate.toISOString().split('T')[0];
        if (newVaccinationDate !== dog.vaccinationDate) {
          updates.vaccinationDate = newVaccinationDate;
        }
      } else if (dog.vaccinationDate) {
        updates.vaccinationDate = null as any;
      }
      
      if (values.gender === 'female') {
        if (values.heatHistory) {
          const currentHeatDates = JSON.stringify(dog.heatHistory || []);
          const convertedHeatHistory = values.heatHistory.map(heat => ({
            date: heat.date ? heat.date.toISOString().split('T')[0] : ''
          }));
          
          const newHeatDates = JSON.stringify(convertedHeatHistory);
          if (currentHeatDates !== newHeatDates) {
            updates.heatHistory = convertedHeatHistory;
          }
        }
        
        if (values.heatInterval !== dog.heatInterval) {
          updates.heatInterval = values.heatInterval;
        }
      }
      
      if (Object.keys(updates).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were detected to save."
        });
        setIsEditing(false);
        setIsSaving(false);
        return;
      }
      
      const result = await updateDog(dog.id, updates);
      
      if (result) {
        setIsEditing(false);
        toast({
          title: "Success",
          description: `${values.name} has been updated successfully.`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setLastError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const success = await removeDog(dog.id);
    if (success) {
      setActiveDog(null);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>
      
      <DogDetailsCard
        dog={dog}
        isEditing={isEditing}
        isSaving={isSaving}
        loading={loading}
        lastError={lastError}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
      />
      
      <DogActions
        isEditing={isEditing}
        onDelete={() => setShowDeleteDialog(true)}
        onEdit={() => setIsEditing(true)}
        loading={loading}
        isSaving={isSaving}
      />
      
      <DeleteDogDialog
        dogName={dog.name}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DogDetails;
