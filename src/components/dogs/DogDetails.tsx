
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, PawPrint, Heart } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { useDogs } from '@/context/DogsContext';
import { DogFormValues } from './DogFormFields';
import { toast } from '@/hooks/use-toast';
import DeleteDogDialog from './delete-dialog/DeleteDogDialog';
import DogDetailsCard from './details/DogDetailsCard';
import DogActions from './actions/DogActions';
import DogLittersSection from './litters/DogLittersSection';
import HeatTrackingTab from './heat-tracking/HeatTrackingTab';
import { checkDogDependencies } from '@/utils/dogDependencyCheck';
import { useTranslation } from 'react-i18next';

interface DogDetailsProps {
  dog: Dog;
  activeTab?: string;
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog, activeTab }) => {
  const { setActiveDog, updateDog, removeDog, loading } = useDogs();
  const { t } = useTranslation('dogs');
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
      console.log('[Dogs Debug] DogDetails handleSave called with values:', values);
      const updates: Partial<Dog> = {};
      
      if (values.name !== dog.name) updates.name = values.name;
      if (values.breed !== dog.breed) updates.breed = values.breed;
      if (values.gender !== dog.gender) updates.gender = values.gender;
      if (values.color !== dog.color) updates.color = values.color;
      if (values.notes !== dog.notes) updates.notes = values.notes;
      if (values.registrationNumber !== dog.registrationNumber) {
        updates.registrationNumber = values.registrationNumber;
      }
      if (values.registeredName !== dog.registeredName) {
        updates.registeredName = values.registeredName;
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
      
      if (values.sterilizationDate) {
        const newSterilizationDate = values.sterilizationDate.toISOString().split('T')[0];
        if (newSterilizationDate !== dog.sterilizationDate) {
          updates.sterilizationDate = newSterilizationDate;
          console.log('[Dogs Debug] Sterilization date updated:', newSterilizationDate);
        }
      } else if (dog.sterilizationDate) {
        updates.sterilizationDate = null as any;
        console.log('[Dogs Debug] Sterilization date cleared');
      }
      
      // Enhanced heat history handling for female dogs
      if (values.gender === 'female') {
        console.log('[Dogs Debug] Processing female dog heat history');
        console.log('[Dogs Debug] Current dog heat history:', dog.heatHistory);
        console.log('[Dogs Debug] Form heat history values:', values.heatHistory);
        
        if (values.heatHistory) {
          // Convert form heat history to database format
          const convertedHeatHistory = values.heatHistory.map(heat => ({
            date: heat.date ? heat.date.toISOString().split('T')[0] : ''
          }));
          
          console.log('[Dogs Debug] Converted heat history:', convertedHeatHistory);
          
          // Always include heat history in updates for female dogs to ensure it gets saved
          // This prevents the "no changes detected" issue
          updates.heatHistory = convertedHeatHistory;
          console.log('[Dogs Debug] Added heat history to updates');
        } else {
          // If no heat history provided, ensure we set an empty array
          updates.heatHistory = [];
          console.log('[Dogs Debug] Set empty heat history array');
        }

        // Always send heatHistory for female dogs (remove heatInterval handling)
      }

      console.log('[Dogs Debug] Final updates object:', updates);

      // Remove the "no changes" validation - let the backend handle this
      // This ensures heat history updates are always attempted
      const result = await updateDog(dog.id, updates);
      
      if (result) {
        setIsEditing(false);
        toast({
          title: "Success",
          description: `${values.name} has been updated successfully.`,
        });
        console.log('[Dogs Debug] Dog update completed successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('[Dogs Debug] Error during dog update:', errorMessage);
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
    console.log('Deletion requested for dog:', dog.id, dog.name);
    
    try {
      // Check for dependencies first
      const dependencyCheck = await checkDogDependencies(dog.id);
      
      if (dependencyCheck.hasDependencies) {
        // Dog has dependencies - show toast message and return false to prevent deletion
        toast({
          title: "Cannot Delete Dog",
          description: dependencyCheck.message,
          variant: "destructive"
        });
        return false;
      }
      
      // No dependencies - proceed with deletion
      const success = await removeDog(dog.id);
      console.log('Deletion result:', success);
      
      if (success) {
        console.log('Deletion successful, navigating back to list');
        setActiveDog(null);
        return true;
      } else {
        console.error('Deletion failed with no error thrown');
        toast({
          title: "Deletion failed",
          description: "Could not delete dog. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Deletion error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>
      
      <Tabs defaultValue={activeTab || "overview"} className="w-full">
        <TabsList className={`grid w-full ${dog.gender === 'female' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PawPrint className="h-4 w-4" />
            {t('tabs.overview')}
          </TabsTrigger>
          {dog.gender === 'female' && (
            <TabsTrigger value="heat-tracking" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t('tabs.heat')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <DogDetailsCard
            dog={dog}
            isEditing={isEditing}
            isSaving={isSaving}
            loading={loading}
            lastError={lastError}
            onSave={handleSave}
            onCancelEdit={() => setIsEditing(false)}
            onDelete={() => setShowDeleteDialog(true)}
            onEdit={() => setIsEditing(true)}
          />
          
          <DogLittersSection dog={dog} />
        </TabsContent>

        {dog.gender === 'female' && (
          <TabsContent value="heat-tracking" className="mt-6">
            <HeatTrackingTab dog={dog} />
          </TabsContent>
        )}
      </Tabs>
      
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
