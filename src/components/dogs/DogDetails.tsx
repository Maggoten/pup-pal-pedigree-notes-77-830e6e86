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
    setLastError(null);
    setIsSaving(true);
    
    try {
      const updates: Partial<Dog> = {};
      
      // Only include fields that have changed
      if (values.name !== dog.name) updates.name = values.name;
      if (values.breed !== dog.breed) updates.breed = values.breed;
      if (values.gender !== dog.gender) updates.gender = values.gender;
      if (values.color !== dog.color) updates.color = values.color;
      if (values.notes !== dog.notes) updates.notes = values.notes;
      if (values.registrationNumber !== dog.registrationNumber) {
        updates.registrationNumber = values.registrationNumber;
      }
      if (values.image !== dog.image) updates.image = values.image;
      
      // Format dates for comparison
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
      
      // Only update heat-related fields for female dogs
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
      
      // If no changes detected, return early
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
