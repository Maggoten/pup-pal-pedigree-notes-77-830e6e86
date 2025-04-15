
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Dog as DogIcon, ArrowLeft, Trash2 } from 'lucide-react';
import { Dog, useDogs } from '@/context/DogsContext';
import DogInfoDisplay from './DogInfoDisplay';
import DogEditForm from './DogEditForm';
import { DogFormValues } from './DogFormFields';
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
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog }) => {
  const { setActiveDog, updateDog, removeDog, loading } = useDogs();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleBack = () => {
    setActiveDog(null);
  };

  const handleSave = async (values: DogFormValues) => {
    // Set local saving state to provide immediate feedback
    setIsSaving(true);
    
    try {
      // Convert date objects to ISO strings for storage
      const formattedValues = {
        name: values.name,
        breed: values.breed,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth.toISOString().split('T')[0],
        color: values.color,
        registrationNumber: values.registrationNumber,
        notes: values.notes,
        image: values.image, // Use the updated image from the form
        dewormingDate: values.dewormingDate ? values.dewormingDate.toISOString().split('T')[0] : undefined,
        vaccinationDate: values.vaccinationDate ? values.vaccinationDate.toISOString().split('T')[0] : undefined,
        heatHistory: values.heatHistory ? values.heatHistory.map(heat => ({
          date: heat.date.toISOString().split('T')[0]
        })) : undefined,
        heatInterval: values.heatInterval
      };
      
      const success = await updateDog(dog.id, formattedValues);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving dog:", error);
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
              isLoading={isSaving || loading}
            />
          ) : (
            <DogInfoDisplay dog={dog} />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading || isSaving}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} disabled={loading || isSaving}>Edit</Button>
          ) : null}
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {dog.name} from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DogDetails;
