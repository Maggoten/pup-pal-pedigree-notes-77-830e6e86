
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dog as DogIcon, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import DogInfoDisplay from './DogInfoDisplay';
import DogEditForm from './DogEditForm';
import { DogFormValues } from './schema/dogFormSchema';
import { Dog } from '@/types/dogs';
import { useDogs } from '@/hooks/useDogs';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DogDetailsProps {
  dog: Dog;
  onBack: () => void;
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog, onBack }) => {
  const { updateDog, deleteDog, isUpdatingDog, isDeletingDog, refreshDogs } = useDogs();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleBack = () => {
    if (isEditing) {
      // Confirm before navigating away from unsaved changes
      if (window.confirm("You have unsaved changes. Are you sure you want to go back?")) {
        setIsEditing(false);
        onBack();
      }
    } else {
      onBack();
    }
  };

  const handleSave = async (values: DogFormValues) => {
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
    
    await updateDog(dog.id, formattedValues);
    await refreshDogs();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteDog(dog.id, dog.name);
    onBack();
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DogIcon className="h-5 w-5" />
            {isEditing ? 'Edit Dog' : dog.name}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update dog information' : `${dog.breed} • ${dog.gender === 'male' ? 'Male' : 'Female'}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <DogEditForm 
              dog={dog} 
              onCancel={() => setIsEditing(false)} 
              onSave={handleSave}
              isSaving={isUpdatingDog}
            />
          ) : (
            <DogInfoDisplay dog={dog} />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {!isEditing && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
                disabled={isDeletingDog}
              >
                {isDeletingDog ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {dog.name} from your dogs list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingDog}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeletingDog}
            >
              {isDeletingDog ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DogDetails;
