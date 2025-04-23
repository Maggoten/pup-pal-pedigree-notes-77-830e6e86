
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
import { Dog as DogIcon, ArrowLeft, Trash2, Save, Loader2 } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';

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
    // Clear any previous errors
    setLastError(null);
    
    // Set local saving state to provide immediate feedback
    setIsSaving(true);
    
    try {
      console.log('Preparing to save dog with values:', values);
      
      // Convert date objects to ISO strings for storage
      const formattedValues: Partial<Dog> = {
        name: values.name,
        breed: values.breed,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth.toISOString().split('T')[0],
        color: values.color,
        registrationNumber: values.registrationNumber,
        notes: values.notes,
        dewormingDate: values.dewormingDate ? values.dewormingDate.toISOString().split('T')[0] : undefined,
        vaccinationDate: values.vaccinationDate ? values.vaccinationDate.toISOString().split('T')[0] : undefined,
        heatHistory: values.heatHistory ? values.heatHistory.map(heat => ({
          date: heat.date.toISOString().split('T')[0]
        })) : undefined,
        heatInterval: values.heatInterval
      };
      
      // Only include the image if it has actually changed
      if (values.image !== dog.image) {
        formattedValues.image = values.image;
        console.log('Image has changed, including in update');
      } else {
        console.log('Image has not changed, excluding from update');
      }
      
      console.log('Calling updateDog with:', dog.id, formattedValues);
      
      // Add a timeout to detect hanging requests
      const updatePromise = updateDog(dog.id, formattedValues);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Update request timed out")), 10000)
      );
      
      const result = await Promise.race([updatePromise, timeoutPromise]);
      
      if (result) {
        console.log('Dog updated successfully:', result);
        toast({
          title: "Success",
          description: `${values.name} has been updated successfully.`,
        });
        setIsEditing(false);
      } else {
        console.error('Update returned null result');
        setLastError("The update may not have been saved. Please try again.");
        toast({
          title: "Update Issue",
          description: "The update may not have been saved. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error saving dog:", error);
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
          
          {lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
              <strong>Error:</strong> {lastError}
            </div>
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
            <Button onClick={() => setIsEditing(true)} disabled={loading || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Edit
            </Button>
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
